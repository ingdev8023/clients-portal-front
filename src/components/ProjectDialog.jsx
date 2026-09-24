import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';
import { slugify } from '../lib/format';

const EMPTY_PROJECT = {
  client_id: '', name: '', slug: '', description: '', status: 'planned',
  progress_percentage: 0, start_date: '', estimated_end_date: '',
};

export default function ProjectDialog({ dialog, clients, saving, error, onClose, onSave }) {
  const [project, setProject] = useState(() => dialog.project ? { ...EMPTY_PROJECT, ...dialog.project } : EMPTY_PROJECT);
  const [slugWasEdited, setSlugWasEdited] = useState(dialog.mode === 'edit');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  const updateField = (field, value) => setProject((current) => ({ ...current, [field]: value }));
  const handleNameChange = (value) => setProject((current) => ({ ...current, name: value, slug: slugWasEdited ? current.slug : slugify(value) }));

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section className="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="dialog-header">
          <div><p className="eyebrow">Project details</p><h2 id="project-dialog-title">{dialog.mode === 'create' ? 'Create project' : 'Manage project'}</h2></div>
          <button className="icon-button" type="button" onClick={onClose} disabled={saving} aria-label="Close dialog" title="Close"><X size={20} /></button>
        </header>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <form className="project-form" onSubmit={(event) => { event.preventDefault(); onSave(project); }}>
          <div className="form-grid">
            <div className="form-group"><label className="form-label" htmlFor="project-client">Client</label><select id="project-client" className="form-input" value={project.client_id} onChange={(event) => updateField('client_id', event.target.value)} disabled={saving} required><option value="">Select a client</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></div>
            <div className="form-group"><label className="form-label" htmlFor="project-status">Status</label><select id="project-status" className="form-input" value={project.status} onChange={(event) => updateField('status', event.target.value)} disabled={saving}><option value="planned">Planned</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
          </div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label" htmlFor="project-name">Name</label><input id="project-name" className="form-input" value={project.name} onChange={(event) => handleNameChange(event.target.value)} disabled={saving} required maxLength="120" /></div>
            <div className="form-group"><label className="form-label" htmlFor="project-slug">Slug</label><input id="project-slug" className="form-input" value={project.slug} onChange={(event) => { setSlugWasEdited(true); updateField('slug', event.target.value.toLowerCase()); }} disabled={saving} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /></div>
          </div>
          <div className="form-group"><label className="form-label" htmlFor="project-description">Description</label><textarea id="project-description" className="form-input" rows="3" value={project.description || ''} onChange={(event) => updateField('description', event.target.value)} disabled={saving} maxLength="1000" /></div>
          <div className="form-grid form-grid--three">
            <div className="form-group"><label className="form-label" htmlFor="project-progress">Progress</label><input id="project-progress" className="form-input" type="number" min="0" max="100" value={project.progress_percentage} onChange={(event) => updateField('progress_percentage', Number(event.target.value))} disabled={saving} /></div>
            <div className="form-group"><label className="form-label" htmlFor="project-start">Start date</label><input id="project-start" className="form-input" type="date" value={project.start_date || ''} onChange={(event) => updateField('start_date', event.target.value)} disabled={saving} /></div>
            <div className="form-group"><label className="form-label" htmlFor="project-end">Target date</label><input id="project-end" className="form-input" type="date" value={project.estimated_end_date || ''} onChange={(event) => updateField('estimated_end_date', event.target.value)} disabled={saving} /></div>
          </div>
          <footer className="dialog-actions"><button className="btn btn-secondary" type="button" onClick={onClose} disabled={saving}>Cancel</button><button className="btn btn-primary" type="submit" disabled={saving}><Save size={18} />{saving ? 'Saving...' : 'Save project'}</button></footer>
        </form>
      </section>
    </div>
  );
}
