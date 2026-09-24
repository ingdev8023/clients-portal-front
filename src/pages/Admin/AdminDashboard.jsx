import { Building2, FolderKanban, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import { useAdminDashboardController } from '../../controllers/useAdminDashboardController';
import { formatDateOnly } from '../../lib/format';

export default function AdminDashboard() {
  const controller = useAdminDashboardController();
  const activeProjects = controller.projects.filter((project) => project.status === 'active').length;

  if (controller.loading) return <AdminDashboardSkeleton />;

  if (controller.error) {
    return (
      <div className="page-state page-state--error" role="alert">
        <p>{controller.error}</p>
        <button className="btn btn-secondary" type="button" onClick={controller.reload}><RefreshCw size={18} /> Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <header className="page-header">
        <div><p className="eyebrow">Operations</p><h1>Project dashboard</h1><p>Manage client work and keep progress current.</p></div>
        {controller.clients.length ? (
          <Link className="btn btn-primary" to="/admin/projects/new"><Plus size={18} /> New project</Link>
        ) : (
          <span className="btn btn-primary is-disabled" aria-disabled="true"><Plus size={18} /> New project</span>
        )}
      </header>

      <section className="stats-grid" aria-label="Dashboard summary">
        <article className="stat-card"><div className="stat-icon stat-icon--teal"><Building2 size={22} /></div><div><strong>{controller.clients.length}</strong><span>Total clients</span></div></article>
        <article className="stat-card"><div className="stat-icon stat-icon--coral"><FolderKanban size={22} /></div><div><strong>{controller.projects.length}</strong><span>Total projects</span></div></article>
        <article className="stat-card"><div className="stat-icon stat-icon--amber"><RefreshCw size={22} /></div><div><strong>{activeProjects}</strong><span>Active projects</span></div></article>
      </section>

      <section id="projects" className="dashboard-section" aria-labelledby="projects-title">
        <div className="section-heading">
          <div><p className="eyebrow">Portfolio</p><h2 id="projects-title">Recent projects</h2></div>
          {!controller.clients.length && <span className="helper-text">Create a client in Supabase before adding a project.</span>}
        </div>

        {controller.projects.length === 0 ? <div className="panel empty-list">No projects found.</div> : (
          <>
            <div className="project-card-list">
              {controller.projects.map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
            <div className="table-shell project-table">
              <div className="responsive-table">
                <table>
                  <thead><tr><th>Project</th><th>Client</th><th>Status</th><th>Progress</th><th>Target date</th></tr></thead>
                  <tbody>
                    {controller.projects.map((project) => (
                      <tr key={project.id}>
                        <td><Link className="project-link" to={`/admin/projects/${project.id}`}>{project.name}</Link><span className="table-secondary">{project.slug}</span></td>
                        <td>{project.client?.name || 'Unknown client'}</td>
                        <td><StatusBadge status={project.status} /></td>
                        <td><div className="progress-cell"><progress className="progress-native progress-native--compact" aria-label={`${project.name} progress`} value={project.progress_percentage} max="100">{project.progress_percentage}%</progress><span>{project.progress_percentage}%</span></div></td>
                        <td>{formatDateOnly(project.estimated_end_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <div><Link className="project-link" to={`/admin/projects/${project.id}`}>{project.name}</Link><span>{project.client?.name || 'Unknown client'}</span></div>
      <StatusBadge status={project.status} />
      <div className="project-card-progress"><progress className="progress-native" value={project.progress_percentage} max="100">{project.progress_percentage}%</progress><span>{project.progress_percentage}%</span></div>
      <span className="project-card-date">Target {formatDateOnly(project.estimated_end_date)}</span>
    </article>
  );
}

function AdminDashboardSkeleton() {
  return (
    <div className="dashboard-stack" aria-label="Loading dashboard">
      <div><div className="skeleton skeleton-title" /><div className="skeleton skeleton-line skeleton-line--short" /></div>
      <div className="stats-grid">{[1, 2, 3].map((item) => <div className="skeleton skeleton-stat" key={item} />)}</div>
      <div className="panel panel-padded"><div className="skeleton skeleton-line" /><div className="skeleton skeleton-row" /><div className="skeleton skeleton-row" /></div>
    </div>
  );
}
