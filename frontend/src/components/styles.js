// src/components/styles.js
export const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #EBF4FF 0%, #FFFFFF 50%, #F3E8FF 100%)',
    padding: '24px',
  },
  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  card: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #F3F4F6',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    color: 'white',
    padding: '24px',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
  },
  headerSubtitle: {
    color: '#DBEAFE',
    marginTop: '8px',
    fontSize: '14px',
  },
  formContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1F2937',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
  },
  actionCard: {
    position: 'relative',
    padding: '24px',
    borderRadius: '12px',
    border: '2px solid #E5E7EB',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  actionCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
    transform: 'scale(1.02)',
  },
  actionCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  actionIcon: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: '#F3F4F6',
  },
  actionIconSelected: {
    backgroundColor: '#DBEAFE',
  },
  actionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: 0,
  },
  actionDescription: {
    fontSize: '14px',
    color: '#6B7280',
    margin: 0,
  },
  radioInput: {
    position: 'absolute',
    top: '16px',
    right: '16px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
  },
  inputFocus: {
    borderColor: '#3B82F6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
    outline: 'none',
  },
  button: {
    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 32px',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease',
  },
  buttonCenter: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '16px',
  },
  searchContainer: {
    padding: '24px',
  },
  searchInputContainer: {
    position: 'relative',
    flex: 1,
  },
  searchInput: {
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9CA3AF',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
  },
  tableHeader: {
    background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
  },
  tableHeaderCell: {
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  tableRow: {
    borderBottom: '1px solid #E5E7EB',
    transition: 'background-color 0.2s ease',
  },
  tableRowHover: {
    backgroundColor: '#EFF6FF',
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px',
    color: '#1F2937',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  badgeSuccess: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
    color: '#D97706',
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 24px',
  },
  emptyStateIcon: {
    backgroundColor: '#F3F4F6',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  loading: {
    padding: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  },
  spinner: {
    border: '2px solid #E5E7EB',
    borderTop: '2px solid #3B82F6',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    animation: 'spin 1s linear infinite',
  },
};

// Animación de spinner
export const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Función para inyectar las animaciones CSS
export const injectStyles = () => {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = spinnerKeyframes;
    document.head.appendChild(styleElement);
  }
};