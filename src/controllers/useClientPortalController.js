import { useCallback, useEffect, useRef, useState } from 'react';
import { createComment, getPortalData } from '../models/clientPortalModel';
import { toUserMessage } from '../lib/errors';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';

export function useClientPortalController() {
  const { user } = useAuth();
  const { t } = usePreferences();
  const requestId = useRef(0);
  const [data, setData] = useState({
    projects: [],
    project: null,
    phases: [],
    updates: [],
    payments: [],
    comments: [],
  });
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  const loadPortal = useCallback(async (projectId = '') => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const nextData = await getPortalData(projectId);
      // A slower request for a previously selected project must not overwrite
      // the latest selection after the user changes projects quickly.
      if (currentRequest !== requestId.current) return;
      setData(nextData);
      setSelectedProjectId(nextData.project?.id || '');
    } catch (loadError) {
      if (currentRequest === requestId.current) {
        setError(toUserMessage(loadError, t('errors.portal'), t));
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    getPortalData()
      .then((nextData) => {
        if (currentRequest !== requestId.current) return;
        setData(nextData);
        setSelectedProjectId(nextData.project?.id || '');
      })
      .catch((loadError) => {
        if (currentRequest === requestId.current) {
          setError(toUserMessage(loadError, t('errors.portal'), t));
        }
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false);
      });
  }, [t]);

  const selectProject = (projectId) => {
    setSelectedProjectId(projectId);
    loadPortal(projectId);
  };

  const postComment = async () => {
    const message = comment.trim();
    if (!message) {
      setCommentError(t('validation.commentRequired'));
      return;
    }
    if (message.length > 2000) {
      setCommentError(t('validation.commentLength'));
      return;
    }

    setPostingComment(true);
    setCommentError('');
    try {
      await createComment({ projectId: data.project.id, userId: user.id, message });
      setComment('');
      await loadPortal(data.project.id);
    } catch (postError) {
      setCommentError(toUserMessage(postError, t('errors.commentPost'), t));
    } finally {
      setPostingComment(false);
    }
  };

  return {
    ...data,
    selectedProjectId,
    loading,
    error,
    comment,
    commentError,
    postingComment,
    setComment,
    selectProject,
    postComment,
    reload: () => loadPortal(selectedProjectId),
  };
}
