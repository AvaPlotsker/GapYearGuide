import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  createSchoolFromData,
  validateSchool,
  exportToJSON,
  scrapeSources,
  determineSchoolType,
  normalizeLocation,
  normalizeHashkafa
} from '../utils/schoolScraper';
import { importDetailedSchools } from '../utils/importDetailedSchools';

export default function SchoolScraper() {
  const { user } = useApp();
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [scrapedData, setScrapedData] = useState([]);
  const [manualEntry, setManualEntry] = useState({
    name: '',
    location: '',
    type: '',
    hashkafa: '',
    website: '',
    description: '',
    cost: '',
    phone: '',
    email: ''
  });
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleManualAdd = () => {
    if (!manualEntry.name || !manualEntry.location) {
      alert('Name and location are required');
      return;
    }

    const school = createSchoolFromData(manualEntry);
    const validation = validateSchool(school);

    if (!validation.valid) {
      alert('Validation errors:\n' + validation.errors.join('\n'));
      return;
    }

    setScrapedData([...scrapedData, school]);

    // Reset form
    setManualEntry({
      name: '',
      location: '',
      type: '',
      hashkafa: '',
      website: '',
      description: '',
      cost: '',
      phone: '',
      email: ''
    });
  };

  const handleRemoveSchool = (index) => {
    setScrapedData(scrapedData.filter((_, i) => i !== index));
  };

  const handleImportToFirebase = async () => {
    if (scrapedData.length === 0) {
      alert('No schools to import');
      return;
    }

    if (!confirm(`Import ${scrapedData.length} schools to Firebase?`)) {
      return;
    }

    setImporting(true);
    setImportResults(null);

    try {
      const results = await importDetailedSchools(scrapedData);
      setImportResults(results);

      if (results.success.length > 0) {
        // Clear scraped data after successful import
        setScrapedData([]);
      }
    } catch (error) {
      alert('Import failed: ' + error.message);
      console.error(error);
    }

    setImporting(false);
  };

  const handleExportJSON = () => {
    const json = exportToJSON(scrapedData);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schools_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-header">
          <h2 className="page-title">School Data Scraper</h2>
          <p className="page-description">
            Collect and structure school data from various sources
          </p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Instructions Section */}
          <section style={{
            padding: '2rem',
            backgroundColor: '#e3f2fd',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '2px solid #2196F3'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#1976D2' }}>How to Use This Tool</h3>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>
                <strong>Use Claude Code to fetch website data:</strong>
                <ul style={{ marginTop: '0.5rem', marginLeft: '1.5rem' }}>
                  <li>Ask Claude to use WebFetch to scrape school directories</li>
                  <li>Or manually enter school information in the form below</li>
                </ul>
              </li>
              <li><strong>Review and edit</strong> the collected data in the table</li>
              <li><strong>Export to JSON</strong> for backup or manual review</li>
              <li><strong>Import to Firebase</strong> to add schools to your database</li>
            </ol>
          </section>

          {/* Source Directories */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Recommended Sources to Scrape</h3>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary-color)' }}>Directories:</h4>
              <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
                {scrapeSources.directories.map((source, idx) => (
                  <li key={idx}>
                    <strong>{source.name}:</strong>{' '}
                    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>
                      {source.url}
                    </a>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {source.notes}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary-color)' }}>
                  Major Seminaries ({scrapeSources.majorSeminaries.length}):
                </h4>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  fontSize: '0.875rem'
                }}>
                  <ul style={{ marginLeft: '1.25rem', lineHeight: '1.6' }}>
                    {scrapeSources.majorSeminaries.map((sem, idx) => (
                      <li key={idx}>{sem}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: '0.75rem', color: 'var(--primary-color)' }}>
                  Major Yeshivas ({scrapeSources.majorYeshivas.length}):
                </h4>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  maxHeight: '300px',
                  overflow: 'auto',
                  fontSize: '0.875rem'
                }}>
                  <ul style={{ marginLeft: '1.25rem', lineHeight: '1.6' }}>
                    {scrapeSources.majorYeshivas.map((yesh, idx) => (
                      <li key={idx}>{yesh}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Manual Entry Form */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Add School Manually</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  School Name *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={manualEntry.name}
                  onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
                  placeholder="e.g., Nishmat, Hakotel, Darchei Binah"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Location *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={manualEntry.location}
                  onChange={(e) => setManualEntry({ ...manualEntry, location: e.target.value })}
                  placeholder="e.g., Jerusalem, Safed, Beit Shemesh"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Type
                </label>
                <select
                  className="form-input"
                  value={manualEntry.type}
                  onChange={(e) => setManualEntry({ ...manualEntry, type: e.target.value })}
                >
                  <option value="">Auto-detect from name</option>
                  <option value="seminary">Seminary</option>
                  <option value="yeshiva">Yeshiva</option>
                  <option value="gap-year-program">Gap Year Program</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Hashkafa
                </label>
                <select
                  className="form-input"
                  value={manualEntry.hashkafa}
                  onChange={(e) => setManualEntry({ ...manualEntry, hashkafa: e.target.value })}
                >
                  <option value="">Select hashkafa</option>
                  <option value="modern-orthodox">Modern Orthodox</option>
                  <option value="yeshivish">Yeshivish</option>
                  <option value="chassidish">Chassidish</option>
                  <option value="religious-zionist">Religious Zionist</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Website
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={manualEntry.website}
                  onChange={(e) => setManualEntry({ ...manualEntry, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Cost (USD/year)
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={manualEntry.cost}
                  onChange={(e) => setManualEntry({ ...manualEntry, cost: e.target.value })}
                  placeholder="e.g., 25000 or $25,000"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  className="form-input"
                  value={manualEntry.phone}
                  onChange={(e) => setManualEntry({ ...manualEntry, phone: e.target.value })}
                  placeholder="+972-..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Email
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={manualEntry.email}
                  onChange={(e) => setManualEntry({ ...manualEntry, email: e.target.value })}
                  placeholder="info@..."
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  className="form-input"
                  rows="3"
                  value={manualEntry.description}
                  onChange={(e) => setManualEntry({ ...manualEntry, description: e.target.value })}
                  placeholder="Brief description of the school..."
                />
              </div>
            </div>

            <button
              onClick={handleManualAdd}
              className="btn btn-primary"
              style={{ marginTop: '1.5rem' }}
            >
              Add to Collection
            </button>
          </section>

          {/* Scraped Data Table */}
          {scrapedData.length > 0 && (
            <section style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Collected Schools ({scrapedData.length})</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleExportJSON} className="btn btn-secondary">
                    Export JSON
                  </button>
                  <button
                    onClick={handleImportToFirebase}
                    disabled={importing}
                    className="btn btn-primary"
                  >
                    {importing ? 'Importing...' : 'Import to Firebase'}
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.875rem'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Location</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Hashkafa</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Cost</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left' }}>Website</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapedData.map((school, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.75rem' }}>{school.name}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: school.type === 'seminary' ? '#e3f2fd' : '#fff3e0',
                            color: school.type === 'seminary' ? '#1976D2' : '#F57C00',
                            fontSize: '0.75rem'
                          }}>
                            {school.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{school.location}</td>
                        <td style={{ padding: '0.75rem' }}>{school.hashkafa}</td>
                        <td style={{ padding: '0.75rem' }}>${school.cost?.toLocaleString()}</td>
                        <td style={{ padding: '0.75rem' }}>
                          {school.website && (
                            <a href={school.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)' }}>
                              Link
                            </a>
                          )}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemoveSchool(idx)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Import Results */}
          {importResults && (
            <section style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Import Results</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                    {importResults.success.length}
                  </div>
                  <div style={{ color: '#155724' }}>Successful</div>
                </div>

                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#721c24' }}>
                    {importResults.failed.length}
                  </div>
                  <div style={{ color: '#721c24' }}>Failed</div>
                </div>
              </div>

              {importResults.failed.length > 0 && (
                <details style={{ marginTop: '1rem' }}>
                  <summary style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>
                    View failed imports
                  </summary>
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '4px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {importResults.failed.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                        <strong>{item.name}</strong>: {item.error}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
