import { Building2, FolderKanban, Pencil, Plus, RefreshCw } from 'lucide-react';
import ProjectDialog from '../../components/ProjectDialog';
import StatusBadge from '../../components/StatusBadge';
import { useAdminDashboardController } from '../../controllers/useAdminDashboardController';
import { formatDateOnly } from '../../lib/format';

export default function AdminDashboard() {
  const controller = useAdminDashboardController();
  const activeProjects = controller.projects.filter((project) => project.status === 'active').length;

  if (controller.loading) return <div className="page-state">Loading dashboard...</div>;

  if (controller.error) {
    return (
      <div className="page-state page-state--error" role="alert">
        <p>{controller.error}</p>
        <button className="btn btn-secondary" type="button" onClick={controller.reload}>
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operations</p>
          <h1>Project dashboard</h1>
          <p>Manage client work and keep progress current.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={controller.openCreateDialog} disabled={!controller.clients.length}>
          <Plus size={18} /> New project
        </button>
      </header>

      <section className="stats-grid" aria-label="Dashboard summary">
        <article className="stat-card">
          <div className="stat-icon stat-icon--teal"><Building2 size={22} /></div>
          <div><strong>{controller.clients.length}</strong><span>Total clients</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon stat-icon--coral"><FolderKanban size={22} /></div>
          <div><strong>{controller.projects.length}</strong><span>Total projects</span></div>
        </article>
        <article className="stat-card">
          <div className="stat-icon stat-icon--amber"><RefreshCw size={22} /></div>
          <div><strong>{activeProjects}</strong><span>Active projects</span></div>
        </article>
      </section>

      <section id="projects" className="dashboard-section" aria-labelledby="projects-title">
        <div className="section-heading">
          <div><p className="eyebrow">Portfolio</p><h2 id="projects-title">Recent projects</h2></div>
          {!controller.clients.length && <span className="helper-text">Create a client in Supabase before adding a project.</span>}
        </div>

        <div className="table-shell">
          <div className="responsive-table">
            <table>
              <thead>
                <tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th><th>Target date</th><th><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody>
                {controller.projects.length === 0 ? (
                  <tr><td colSpan="6" className="table-empty">No projects found.</td></tr>
                ) : controller.projects.map((project) => (
                  <tr key={project.id}>
                    <td><strong>{project.name}</strong><span className="table-secondary">{project.slug}</span></td>
                    <td>{project.client?.name || 'Unknown client'}</td>
                    <td><StatusBadge status={project.status} /></td>
                    <td>
                      <div className="progress-cell">
                        <progress className="progress-native progress-native--compact" aria-label={`${project.name} progress`} value={project.progress_percentage} max="100">{project.progress_percentage}%</progress>
                        <span>{project.progress_percentage}%</span>
                      </div>
                    </td>
                    <td>{formatDateOnly(project.estimated_end_date)}</td>
                    <td className="table-action">
                      <button className="icon-button" type="button" onClick={() => controller.openEditDialog(project)} aria-label={`Manage ${project.name}`} title="Manage project"><Pencil size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {controller.dialog && (
        <ProjectDialog key={`${controller.dialog.mode}-${controller.dialog.project?.id || 'new'}`} dialog={controller.dialog} clients={controller.clients} saving={controller.saving} error={controller.formError} onClose={controller.closeDialog} onSave={controller.saveProject} />
      )}
    </div>
  );
}
