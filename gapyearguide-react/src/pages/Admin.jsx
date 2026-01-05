import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { schoolManager } from '../services/firebase';

export default function Admin() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    type: 'seminary',
    location: 'jerusalem',
    hashkafa: 'modern-orthodox',
    size: 'medium',
    studentCount: '',
    cost: '',
    programFocus: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    applicationDeadline: '',
    academicLevel: 'intermediate',
    meals: {
      perDay: '',
      included: []
    },
    shabbos: {
      pattern: '',
      details: ''
    },
    distances: {
      kotel: '',
      centerCity: '',
      shopping: ''
    },
    shanaBet: {
      offered: false,
      programType: '',
      duration: ''
    },
    chessed: {
      required: false,
      day: '',
      hours: ''
    },
    amenities: {
      nearby: [],
      onSite: []
    },
    transportation: {
      buses: [],
      taxiAvailability: '',
      walkability: ''
    },
    delivery: {
      food: false,
      groceries: false,
      services: []
    },
    tags: []
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadSchools();
  }, [user]);

  const loadSchools = async () => {
    setLoading(true);
    const result = await schoolManager.getAllSchools();
    if (result.success) {
      setSchools(result.schools);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert string numbers to integers
    const schoolData = {
      ...formData,
      studentCount: parseInt(formData.studentCount) || 0,
      cost: parseInt(formData.cost) || 0,
      meals: {
        ...formData.meals,
        perDay: parseInt(formData.meals.perDay) || 0
      }
    };

    if (editingSchool) {
      const result = await schoolManager.updateSchool(editingSchool.id, schoolData);
      if (result.success) {
        alert('School updated successfully!');
        setShowForm(false);
        setEditingSchool(null);
        resetForm();
        loadSchools();
      } else {
        alert('Error: ' + result.error);
      }
    } else {
      const result = await schoolManager.addSchool(schoolData);
      if (result.success) {
        alert('School added successfully!');
        setShowForm(false);
        resetForm();
        loadSchools();
      } else {
        alert('Error: ' + result.error);
      }
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name || '',
      type: school.type || 'seminary',
      location: school.location || 'jerusalem',
      hashkafa: school.hashkafa || 'modern-orthodox',
      size: school.size || 'medium',
      studentCount: school.studentCount || '',
      cost: school.cost || '',
      programFocus: school.programFocus || '',
      description: school.description || '',
      website: school.website || '',
      phone: school.phone || '',
      email: school.email || '',
      address: school.address || '',
      applicationDeadline: school.applicationDeadline || '',
      academicLevel: school.academicLevel || 'intermediate',
      meals: school.meals || { perDay: '', included: [] },
      shabbos: school.shabbos || { pattern: '', details: '' },
      distances: school.distances || { kotel: '', centerCity: '', shopping: '' },
      shanaBet: school.shanaBet || { offered: false, programType: '', duration: '' },
      chessed: school.chessed || { required: false, day: '', hours: '' },
      amenities: school.amenities || { nearby: [], onSite: [] },
      transportation: school.transportation || { buses: [], taxiAvailability: '', walkability: '' },
      delivery: school.delivery || { food: false, groceries: false, services: [] },
      tags: school.tags || []
    });
    setShowForm(true);
  };

  const handleDelete = async (schoolId) => {
    if (!confirm('Are you sure you want to delete this school?')) return;

    const result = await schoolManager.deleteSchool(schoolId);
    if (result.success) {
      alert('School deleted successfully!');
      loadSchools();
    } else {
      alert('Error: ' + result.error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'seminary',
      location: 'jerusalem',
      hashkafa: 'modern-orthodox',
      size: 'medium',
      studentCount: '',
      cost: '',
      programFocus: '',
      description: '',
      website: '',
      phone: '',
      email: '',
      address: '',
      applicationDeadline: '',
      academicLevel: 'intermediate',
      meals: { perDay: '', included: [] },
      shabbos: { pattern: '', details: '' },
      distances: { kotel: '', centerCity: '', shopping: '' },
      shanaBet: { offered: false, programType: '', duration: '' },
      chessed: { required: false, day: '', hours: '' },
      amenities: { nearby: [], onSite: [] },
      transportation: { buses: [], taxiAvailability: '', walkability: '' },
      delivery: { food: false, groceries: false, services: [] },
      tags: []
    });
  };

  const handleArrayInput = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }));
  };

  if (loading) {
    return (
      <main className="main-content">
        <div className="container">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <div className="container">
        <div style={{ padding: '2rem 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>School Management</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/import" className="btn btn-secondary">
                Import from Excel
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => {
                  resetForm();
                  setEditingSchool(null);
                  setShowForm(true);
                }}
              >
                Add New School
              </button>
            </div>
          </div>

          {showForm ? (
            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3>{editingSchool ? 'Edit School' : 'Add New School'}</h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSchool(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Basic Information */}
                  <div className="form-group">
                    <label htmlFor="name">School Name *</label>
                    <input
                      type="text"
                      id="name"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="type">Type *</label>
                    <select
                      id="type"
                      className="form-input"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      required
                    >
                      <option value="seminary">Seminary</option>
                      <option value="yeshiva">Yeshiva</option>
                      <option value="gap-year-program">Gap Year Program</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="location">Location *</label>
                    <select
                      id="location"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      required
                    >
                      <option value="jerusalem">Jerusalem</option>
                      <option value="ramat-beit-shemesh">Ramat Beit Shemesh</option>
                      <option value="bnei-brak">Bnei Brak</option>
                      <option value="safed">Safed</option>
                      <option value="tel-aviv">Tel Aviv</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="hashkafa">Hashkafa *</label>
                    <select
                      id="hashkafa"
                      className="form-input"
                      value={formData.hashkafa}
                      onChange={(e) => setFormData(prev => ({ ...prev, hashkafa: e.target.value }))}
                      required
                    >
                      <option value="modern-orthodox">Modern Orthodox</option>
                      <option value="yeshivish">Yeshivish</option>
                      <option value="chassidish">Chassidish</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="size">Size *</label>
                    <select
                      id="size"
                      className="form-input"
                      value={formData.size}
                      onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                      required
                    >
                      <option value="small">Small (&lt; 50)</option>
                      <option value="medium">Medium (50-150)</option>
                      <option value="large">Large (&gt; 150)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="studentCount">Student Count *</label>
                    <input
                      type="number"
                      id="studentCount"
                      className="form-input"
                      value={formData.studentCount}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentCount: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="cost">Annual Cost ($) *</label>
                    <input
                      type="number"
                      id="cost"
                      className="form-input"
                      value={formData.cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="academicLevel">Academic Level *</label>
                    <select
                      id="academicLevel"
                      className="form-input"
                      value={formData.academicLevel}
                      onChange={(e) => setFormData(prev => ({ ...prev, academicLevel: e.target.value }))}
                      required
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="programFocus">Program Focus</label>
                  <input
                    type="text"
                    id="programFocus"
                    className="form-input"
                    value={formData.programFocus}
                    onChange={(e) => setFormData(prev => ({ ...prev, programFocus: e.target.value }))}
                    placeholder="e.g., Academic & Spiritual Growth"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows="4"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      className="form-input"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+972-2-123-4567"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="info@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="applicationDeadline">Application Deadline</label>
                    <input
                      type="text"
                      id="applicationDeadline"
                      className="form-input"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, applicationDeadline: e.target.value }))}
                      placeholder="April 15, 2025"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St, Jerusalem"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tags">Tags (comma-separated)</label>
                  <input
                    type="text"
                    id="tags"
                    className="form-input"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleArrayInput('tags', e.target.value)}
                    placeholder="Academic, Well-Established, Warm Environment"
                  />
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary">
                    {editingSchool ? 'Update School' : 'Add School'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowForm(false);
                      setEditingSchool(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Schools List */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>All Schools ({schools.length})</h3>

            {schools.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                No schools found. Add your first school to get started!
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Location</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Students</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Cost</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map(school => (
                      <tr key={school.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>{school.name}</td>
                        <td style={{ padding: '1rem' }}>{school.type}</td>
                        <td style={{ padding: '1rem' }}>
                          {school.location?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </td>
                        <td style={{ padding: '1rem' }}>{school.studentCount}</td>
                        <td style={{ padding: '1rem' }}>${school.cost?.toLocaleString()}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => handleEdit(school)}
                            style={{ marginRight: '0.5rem' }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-secondary btn-small"
                            onClick={() => handleDelete(school.id)}
                            style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
