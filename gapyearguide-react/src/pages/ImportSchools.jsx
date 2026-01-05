import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { importSimpleSchools } from '../utils/importSimpleSchools';
import { importDetailedSchools } from '../utils/importDetailedSchools';
import { deduplicateSchools } from '../utils/deduplicateSchools';
import { fixSchoolTypes } from '../utils/fixSchoolTypes';
import { fixSpecificSchoolsToSeminary } from '../utils/fixSpecificSchools';
import { fixMMYDuplicate } from '../utils/fixMMYDuplicate';
import seminaryData from '../utils/seminaryData.json';
import * as XLSX from 'xlsx';

export default function ImportSchools() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [jsonPreview, setJsonPreview] = useState(null);
  const [importingPredefined, setImportingPredefined] = useState(false);
  const [deduplicating, setDeduplicating] = useState(false);
  const [dedupeResults, setDedupeResults] = useState(null);
  const [fixingTypes, setFixingTypes] = useState(false);
  const [typeFixResults, setTypeFixResults] = useState(null);
  const [fixingSpecific, setFixingSpecific] = useState(false);
  const [specificFixResults, setSpecificFixResults] = useState(null);
  const [fixingMMY, setFixingMMY] = useState(false);
  const [mmyResults, setMMYResults] = useState(null);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        // Read Excel file
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        setJsonPreview(jsonData);
        console.log('Parsed Excel data:', jsonData);
      } catch (error) {
        alert('Error reading file: ' + error.message);
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!jsonPreview || jsonPreview.length === 0) {
      alert('No data to import');
      return;
    }

    if (!confirm(`Import ${jsonPreview.length} schools to Firebase?`)) {
      return;
    }

    setImporting(true);

    try {
      const importResults = await importSimpleSchools(jsonPreview);
      setResults(importResults);
    } catch (error) {
      alert('Import failed: ' + error.message);
      console.error(error);
    }

    setImporting(false);
  };

  const handleImportPredefined = async () => {
    if (!confirm(`Import ${seminaryData.length} pre-configured seminaries from israelgapyear.com directory?\n\nThis includes: ${seminaryData.map(s => s.name).join(', ')}`)) {
      return;
    }

    setImportingPredefined(true);
    setResults(null);

    try {
      const importResults = await importDetailedSchools(seminaryData);
      setResults(importResults);
    } catch (error) {
      alert('Import failed: ' + error.message);
      console.error(error);
    }

    setImportingPredefined(false);
  };

  const handleDeduplicate = async () => {
    if (!confirm('This will find and remove duplicate schools, keeping the most complete version of each.\n\nContinue?')) {
      return;
    }

    setDeduplicating(true);
    setDedupeResults(null);

    try {
      const results = await deduplicateSchools();
      setDedupeResults(results);
    } catch (error) {
      alert('Deduplication failed: ' + error.message);
      console.error(error);
    }

    setDeduplicating(false);
  };

  const handleFixTypes = async () => {
    if (!confirm('This will automatically detect yeshivas based on their names and update their type from "seminary" to "yeshiva".\n\nContinue?')) {
      return;
    }

    setFixingTypes(true);
    setTypeFixResults(null);

    try {
      const results = await fixSchoolTypes();
      setTypeFixResults(results);
    } catch (error) {
      alert('Type fix failed: ' + error.message);
      console.error(error);
    }

    setFixingTypes(false);
  };

  const handleFixSpecific = async () => {
    if (!confirm('This will change specific schools back to "seminary" that were incorrectly marked as yeshivas.\n\nIncludes: Michlelet Mevaseret, Sha\'alvim for Women, Midreshet Lev Hatorah, Aish Gesher for Women.\n\nContinue?')) {
      return;
    }

    setFixingSpecific(true);
    setSpecificFixResults(null);

    try {
      const results = await fixSpecificSchoolsToSeminary();
      setSpecificFixResults(results);
    } catch (error) {
      alert('Fix failed: ' + error.message);
      console.error(error);
    }

    setFixingSpecific(false);
  };

  const handleFixMMY = async () => {
    if (!confirm('This will fix the Michlelet Mevaseret Yerushalayim duplicate:\n\n- Keep the one with more info\n- Add (MMY) to its name\n- Delete the duplicate\n\nContinue?')) {
      return;
    }

    setFixingMMY(true);
    setMMYResults(null);

    try {
      const results = await fixMMYDuplicate();
      setMMYResults(results);
    } catch (error) {
      alert('Fix failed: ' + error.message);
      console.error(error);
    }

    setFixingMMY(false);
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="page-header">
          <h2 className="page-title">Import Schools</h2>
          <p className="page-description">Add schools to your database from pre-configured data or upload your own Excel file</p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Remove Duplicates */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            border: '2px solid #ff6b6b'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#ff6b6b' }}>Remove Duplicate Schools</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              If you imported schools from multiple sources and have duplicates, use this tool to automatically remove them.
              The system will keep the most complete version of each school (the one with more contact info, website, description, etc.).
            </p>

            <button
              onClick={handleDeduplicate}
              disabled={deduplicating}
              className="btn btn-secondary"
              style={{ minWidth: '200px', backgroundColor: '#ff6b6b', borderColor: '#ff6b6b' }}
            >
              {deduplicating ? 'Removing Duplicates...' : 'Remove Duplicates'}
            </button>

            {dedupeResults && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Deduplication Results</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
                      {dedupeResults.duplicatesFound.length}
                    </div>
                    <div style={{ color: '#856404' }}>Duplicate Sets Found</div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                      {dedupeResults.duplicatesRemoved.length}
                    </div>
                    <div style={{ color: '#155724' }}>Schools Removed</div>
                  </div>
                </div>

                {dedupeResults.duplicatesFound.length > 0 && (
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary-color)', marginTop: '1rem' }}>
                      View duplicate details
                    </summary>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}>
                      {dedupeResults.duplicatesFound.map((dup, idx) => (
                        <div key={idx} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #dee2e6' }}>
                          <strong>{dup.name}</strong> - Found {dup.count} copies
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Removed {dup.count - 1} duplicate{dup.count - 1 !== 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {dedupeResults.errors.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '8px'
                  }}>
                    <strong style={{ color: '#721c24' }}>Errors: {dedupeResults.errors.length}</strong>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Fix School Types */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            border: '2px solid #6c757d'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#6c757d' }}>Fix School Types (Seminary vs Yeshiva)</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              If schools were imported with incorrect types (e.g., yeshivas marked as seminaries), use this tool to automatically fix them.
              The system detects yeshivas by looking for keywords like "yeshiva", "yeshivah", "kollel" in the school name.
            </p>

            <button
              onClick={handleFixTypes}
              disabled={fixingTypes}
              className="btn btn-secondary"
              style={{ minWidth: '200px', backgroundColor: '#6c757d', borderColor: '#6c757d' }}
            >
              {fixingTypes ? 'Fixing Types...' : 'Fix School Types'}
            </button>

            {typeFixResults && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Type Fix Results</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#e7f3ff',
                    border: '1px solid #b3d9ff',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#004085' }}>
                      {typeFixResults.checked}
                    </div>
                    <div style={{ color: '#004085' }}>Schools Checked</div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                      {typeFixResults.updated.length}
                    </div>
                    <div style={{ color: '#155724' }}>Types Updated</div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
                      {typeFixResults.alreadyCorrect.length}
                    </div>
                    <div style={{ color: '#856404' }}>Already Correct</div>
                  </div>
                </div>

                {typeFixResults.updated.length > 0 && (
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary-color)', marginTop: '1rem' }}>
                      View updated schools
                    </summary>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}>
                      {typeFixResults.updated.map((school, idx) => (
                        <div key={idx} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                          <strong>{school.name}</strong>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Updated from "{school.oldType}" to "{school.newType}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {typeFixResults.errors.length > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '8px'
                  }}>
                    <strong style={{ color: '#721c24' }}>Errors: {typeFixResults.errors.length}</strong>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Fix Specific Schools Back to Seminary */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            border: '2px solid #17a2b8'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#17a2b8' }}>Fix Specific Schools Back to Seminary</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              If specific schools were incorrectly changed to "yeshiva" when they should be "seminary", use this to fix them.
              This will change: Michlelet Mevaseret Yerushalayim, Sha'alvim for Women, Midreshet Lev Hatorah, and Aish Gesher for Women back to seminary.
            </p>

            <button
              onClick={handleFixSpecific}
              disabled={fixingSpecific}
              className="btn btn-secondary"
              style={{ minWidth: '200px', backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
            >
              {fixingSpecific ? 'Fixing...' : 'Fix Specific Schools'}
            </button>

            {specificFixResults && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Fix Results</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#d4edda',
                    border: '1px solid #c3e6cb',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                      {specificFixResults.updated.length}
                    </div>
                    <div style={{ color: '#155724' }}>Changed to Seminary</div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
                      {specificFixResults.notFound.length}
                    </div>
                    <div style={{ color: '#856404' }}>Not Found</div>
                  </div>
                </div>

                {specificFixResults.updated.length > 0 && (
                  <details>
                    <summary style={{ cursor: 'pointer', color: 'var(--primary-color)', marginTop: '1rem' }}>
                      View updated schools
                    </summary>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      maxHeight: '300px',
                      overflow: 'auto'
                    }}>
                      {specificFixResults.updated.map((school, idx) => (
                        <div key={idx} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                          <strong>{school.name}</strong>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Changed from "{school.oldType}" to "{school.newType}"
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {specificFixResults.notFound.length > 0 && (
                  <details style={{ marginTop: '1rem' }}>
                    <summary style={{ cursor: 'pointer', color: '#856404' }}>
                      View schools not found
                    </summary>
                    <div style={{
                      marginTop: '0.5rem',
                      padding: '1rem',
                      backgroundColor: 'white',
                      borderRadius: '4px'
                    }}>
                      {specificFixResults.notFound.map((name, idx) => (
                        <div key={idx} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {name}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </section>

          {/* Fix MMY Duplicate */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            border: '2px solid #28a745'
          }}>
            <h3 style={{ marginBottom: '1rem', color: '#28a745' }}>Fix MMY Duplicate</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Fix the Michlelet Mevaseret Yerushalayim duplicate by keeping the one with more information, adding (MMY) to its name, and deleting the other.
            </p>

            <button
              onClick={handleFixMMY}
              disabled={fixingMMY}
              className="btn btn-secondary"
              style={{ minWidth: '200px', backgroundColor: '#28a745', borderColor: '#28a745' }}
            >
              {fixingMMY ? 'Fixing...' : 'Fix MMY Duplicate'}
            </button>

            {mmyResults && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ marginBottom: '0.5rem' }}>Fix Results</h4>

                {mmyResults.error ? (
                  <div style={{
                    padding: '1rem',
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '8px',
                    color: '#721c24'
                  }}>
                    Error: {mmyResults.error}
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <strong>Found {mmyResults.found.length} MMY entries:</strong>
                      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                        {mmyResults.found.map((school, idx) => (
                          <li key={idx}>{school.name}</li>
                        ))}
                      </ul>
                    </div>

                    {mmyResults.kept && (
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '8px',
                        marginBottom: '1rem'
                      }}>
                        <strong style={{ color: '#155724' }}>Kept:</strong>
                        <div style={{ marginTop: '0.5rem', color: '#155724' }}>
                          {mmyResults.renamed ? (
                            <>
                              <div>Original: {mmyResults.kept.oldName}</div>
                              <div>Renamed to: <strong>{mmyResults.kept.newName}</strong></div>
                            </>
                          ) : (
                            <div>{mmyResults.kept.name}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {mmyResults.deleted && mmyResults.deleted.length > 0 && (
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '8px'
                      }}>
                        <strong style={{ color: '#856404' }}>Deleted {mmyResults.deleted.length} duplicate(s):</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#856404' }}>
                          {mmyResults.deleted.map((school, idx) => (
                            <li key={idx}>{school.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {mmyResults.found.length < 2 && (
                      <div style={{
                        padding: '1rem',
                        backgroundColor: '#d1ecf1',
                        border: '1px solid #bee5eb',
                        borderRadius: '8px',
                        color: '#0c5460'
                      }}>
                        No duplicates found - only one MMY entry exists.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>

          {/* Quick Import Pre-configured Seminaries */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
            border: '2px solid var(--primary-color)'
          }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Quick Import: Pre-Configured Seminaries</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Import {seminaryData.length} seminaries with complete information gathered from israelgapyear.com and official seminary websites including contact details, costs, locations, hashkafa, meals, shabbos arrangements, and program details.
            </p>

            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              <strong>Includes popular seminaries such as:</strong>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                {seminaryData.slice(0, 10).map((school, idx) => (
                  <li key={idx}>{school.name}</li>
                ))}
                {seminaryData.length > 10 && <li style={{ fontStyle: 'italic' }}>...and {seminaryData.length - 10} more</li>}
              </ul>
            </div>

            <button
              onClick={handleImportPredefined}
              disabled={importingPredefined}
              className="btn btn-primary"
              style={{ minWidth: '250px' }}
            >
              {importingPredefined ? 'Importing...' : `Import ${seminaryData.length} Seminaries`}
            </button>
          </section>
          {/* File Upload */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Step 1: Upload Excel File</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Upload an Excel file (.xlsx) with your schools data. The first row should contain column headers.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{
                  padding: '0.75rem',
                  border: '2px dashed var(--border-color)',
                  borderRadius: '8px',
                  width: '100%',
                  cursor: 'pointer'
                }}
              />
            </div>

            {jsonPreview && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid var(--border-color)'
              }}>
                <strong>Preview:</strong> {jsonPreview.length} schools found
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer', color: 'var(--primary-color)' }}>
                    View first school data
                  </summary>
                  <pre style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '0.875rem'
                  }}>
                    {JSON.stringify(jsonPreview[0], null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </section>

          {/* Column Mapping Guide */}
          <section style={{
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Expected Excel Format</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Your Excel file should have:
            </p>

            <div style={{
              display: 'grid',
              gap: '0.75rem',
              fontSize: '0.875rem',
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div><strong>Column 1:</strong> School Name (seminary or yeshiva)</div>
              <div><strong>Column 2:</strong> Location (e.g., Jerusalem, Safed, Beit Shemesh)</div>
              <div><strong>Column 3:</strong> (Optional - will be ignored)</div>
              <div style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                Note: Other details will be set to defaults and can be updated later in the Admin page.
              </div>
            </div>
          </section>

          {/* Import Button */}
          {jsonPreview && (
            <section style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Step 2: Import to Firebase</h3>
              <button
                onClick={handleImport}
                disabled={importing}
                className="btn btn-primary"
                style={{ minWidth: '200px' }}
              >
                {importing ? 'Importing...' : `Import ${jsonPreview.length} Schools`}
              </button>
            </section>
          )}

          {/* Results */}
          {results && (
            <section style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Import Results</h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
                    {results.success.length}
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
                    {results.failed.length}
                  </div>
                  <div style={{ color: '#721c24' }}>Failed</div>
                </div>
              </div>

              {results.failed.length > 0 && (
                <details>
                  <summary style={{ cursor: 'pointer', color: 'var(--primary-color)', marginTop: '1rem' }}>
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
                    {results.failed.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #dee2e6' }}>
                        <strong>{item.name}</strong>: {item.error}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                  onClick={() => navigate('/admin')}
                  className="btn btn-secondary"
                >
                  Go to Admin Dashboard
                </button>
              </div>
            </section>
          )}

          {/* Instructions */}
          <section style={{
            padding: '2rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '12px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>How to Prepare Your Excel File</h3>
            <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li>Open your Excel file</li>
              <li>Make sure the first row has column headers (Name, Type, Location, etc.)</li>
              <li>Each subsequent row should be one school</li>
              <li>Save the file as .xlsx format</li>
              <li>Upload it here using the file picker above</li>
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
