import React, { useState, useEffect } from 'react';
import { useRomScanner } from '../../../scanner/useRomScanner';
import type { GameEntry } from '../../../scanner/types';
import { formatFileSize } from '../../../scanner/utils';

// Define component styles
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '1rem',
    gap: '1rem',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 10, 20, 0.8)',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
    position: 'relative' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(78, 205, 196, 0.2)',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  button: {
    padding: '0.6rem 1.2rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: '#4ecdc4',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
    boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    fontSize: '0.9rem',
  },
  buttonHover: {
    transform: 'scale(1.05)',
    backgroundColor: '#3dbdb5',
    boxShadow: '0 4px 12px rgba(78, 205, 196, 0.5)',
  },
  buttonDisabled: {
    backgroundColor: '#2a2a2a',
    cursor: 'not-allowed',
    opacity: 0.5,
    boxShadow: 'none',
  },
  status: {
    padding: '0.75rem',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(20, 20, 40, 0.6)',
    backdropFilter: 'blur(10px)',
    marginBottom: '1rem',
    color: '#fff',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)',
  },
  statusIndicator: {
    display: 'inline-block',
    width: '0.6rem',
    height: '0.6rem',
    borderRadius: '50%',
    backgroundColor: '#4ecdc4',
    marginRight: '0.5rem',
    boxShadow: '0 0 8px rgba(78, 205, 196, 0.5)',
  },
  error: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    color: '#ff6b6b',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    borderLeft: '3px solid #ff6b6b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  success: {
    backgroundColor: 'rgba(78, 205, 196, 0.15)',
    color: '#4ecdc4',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    borderLeft: '3px solid #4ecdc4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    flex: 1,
    overflowY: 'auto' as const,
    listStyle: 'none',
    padding: 0,
    margin: 0,
    backgroundColor: 'rgba(15, 15, 30, 0.6)',
    borderRadius: '0.5rem',
    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  listItem: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
  },
  listItemHover: {
    backgroundColor: 'rgba(78, 205, 196, 0.05)',
  },
  listItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameName: {
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
  },
  platform: {
    fontSize: '0.75rem',
    color: '#4ecdc4',
    textTransform: 'uppercase' as const,
    padding: '0.25rem 0.5rem',
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderRadius: '0.25rem',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  fileInfo: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  fileSize: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
    marginTop: '1rem',
    padding: '0.5rem 0',
    borderTop: '1px solid rgba(78, 205, 196, 0.1)',
  },
  secondaryButton: {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(78, 205, 196, 0.3)',
    backgroundColor: 'transparent',
    color: '#4ecdc4',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.85rem',
  },
  secondaryButtonHover: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    borderColor: 'rgba(78, 205, 196, 0.5)',
  },
  noResults: {
    padding: '2rem 1rem',
    textAlign: 'center' as const,
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    height: '100%',
  },
  noResultsIcon: {
    fontSize: '2rem',
    opacity: 0.3,
  },
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 10, 20, 0.85)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: '0.75rem',
    backdropFilter: 'blur(4px)',
  },
  loadingText: {
    color: '#4ecdc4',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: '1rem',
    textShadow: '0 2px 8px rgba(78, 205, 196, 0.5)',
  },
  spinner: {
    borderRadius: '50%',
    width: '3rem',
    height: '3rem',
    border: '0.25rem solid rgba(78, 205, 196, 0.1)',
    borderTopColor: '#4ecdc4',
    animation: 'spin 1s linear infinite',
  },
  scanCount: {
    marginTop: '0.5rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.9rem',
  },
  badge: {
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    color: '#4ecdc4',
    padding: '0.25rem 0.5rem',
    borderRadius: '1rem',
    fontSize: '0.75rem',
    fontWeight: 'bold',
  },
  tooltip: {
    position: 'absolute' as const,
    backgroundColor: 'rgba(15, 15, 30, 0.95)',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.25rem',
    color: 'white',
    fontSize: '0.8rem',
    zIndex: 200,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    maxWidth: '200px',
    pointerEvents: 'none' as const,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    transform: 'translateY(5px)',
  },
  tooltipVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  scanSummary: {
    fontSize: '0.9rem',
    marginTop: '0.5rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  // Responsive styles for smaller screens
  '@media (max-width: 768px)': {
    container: {
      padding: '0.75rem',
    },
    actionsRow: {
      flexDirection: 'column' as const,
    },
    button: {
      padding: '0.5rem 1rem',
      fontSize: '0.85rem',
    },
  },
};

export const RomScanner: React.FC = () => {
  const {
    games,
    isLoading,
    error,
    lastScanDate,
    totalGames,
    scanForGames,
    exportToYamlFile,
    clearResults,
    clearError,
  } = useRomScanner();

  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [hoverState, setHoverState] = useState<Record<string, boolean>>({});
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Simulate scan progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isLoading) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress(prev => {
          // Slow down progress as it gets closer to 100%
          const increment = Math.max(1, 10 - Math.floor(prev / 10));
          const nextProgress = Math.min(95, prev + increment);
          return nextProgress;
        });
      }, 300);
    } else if (scanProgress > 0) {
      // When loading finishes, jump to 100%
      setScanProgress(100);
      interval = setInterval(() => {
        setScanProgress(0);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Handle scanning action
  const handleScan = async () => {
    try {
      await scanForGames();
    } catch (e) {
      // Error handling is managed by the hook
    }
  };

  // Handle export action
  const handleExport = async () => {
    try {
      const path = await exportToYamlFile();
      if (path) {
        setExportSuccess(`Successfully exported to ${path}`);
        setTimeout(() => setExportSuccess(null), 3000);
      }
    } catch (e) {
      // Error handling is managed by the hook
    }
  };

  // Handle button hover
  const handleButtonHover = (id: string, isHovered: boolean) => {
    setHoverState(prev => ({ ...prev, [id]: isHovered }));
  };

  // Handle list item hover/selection
  const handleListItemHover = (id: string, isHovered: boolean) => {
    if (isHovered) {
      setSelectedGameId(id);
    } else if (selectedGameId === id) {
      setSelectedGameId(null);
    }
  };

  // Format last scan date
  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  // Group games by platform
  const gamesByPlatform = games.reduce<Record<string, GameEntry[]>>((acc, game) => {
    const platform = game.platform;
    if (!acc[platform]) acc[platform] = [];
    acc[platform].push(game);
    return acc;
  }, {});

  // Count platforms
  const platformCount = Object.keys(gamesByPlatform).length;

  return (
    <div style={styles.container}>
      {/* Header section */}
      <div style={styles.header}>
        <h2 style={styles.title}>ROM Scanner</h2>
        <button
          style={{
            ...styles.button,
            ...(hoverState.scan ? styles.buttonHover : {}),
            ...(isLoading ? styles.buttonDisabled : {})
          }}
          onClick={handleScan}
          disabled={isLoading}
          onMouseEnter={() => handleButtonHover('scan', true)}
          onMouseLeave={() => handleButtonHover('scan', false)}
        >
          {isLoading ? 'Scanning...' : 'Scan for ROMs'}
        </button>
      </div>

      {/* Status section */}
      {error && (
        <div style={styles.error}>
          <div>
            <strong>Error: </strong>
            {error}
          </div>
          <button 
            style={{
              ...styles.secondaryButton,
              marginLeft: '0.5rem',
              padding: '0.25rem 0.5rem',
            }}
            onClick={clearError}
          >
            Dismiss
          </button>
        </div>
      )}

      {exportSuccess && (
        <div style={styles.success}>
          <div>{exportSuccess}</div>
          <button 
            style={{
              ...styles.secondaryButton,
              marginLeft: '0.5rem',
              padding: '0.25rem 0.5rem',
            }}
            onClick={() => setExportSuccess(null)}
          >
            ✓
          </button>
        </div>
      )}

      {!error && lastScanDate && (
        <div style={styles.status}>
          <div>
            <span style={styles.statusIndicator}></span>
            Last scan: {formatDate(lastScanDate)}
          </div>
          <div>
            <span style={styles.badge}>{totalGames}</span> ROMs found across <span style={styles.badge}>{platformCount}</span> platforms
          </div>
        </div>
      )}

      {/* Results list */}
      <ul style={styles.list}>
        {games.length === 0 && !isLoading ? (
          <div style={styles.noResults}>
            <div style={styles.noResultsIcon}>🎮</div>
            <div>No ROMs found. Click "Scan for ROMs" to start scanning.</div>
          </div>
        ) : (
          games.map((game: GameEntry) => (
            <li 
              key={game.id} 
              style={{
                ...styles.listItem,
                ...(selectedGameId === game.id || hoverState[`game_${game.id}`] ? styles.listItemHover : {})
              }}
              onMouseEnter={() => {
                handleButtonHover(`game_${game.id}`, true);
                handleListItemHover(game.id, true);
              }}
              onMouseLeave={() => {
                handleButtonHover(`game_${game.id}`, false);
                handleListItemHover(game.id, false);
              }}
            >
              <div style={styles.listItemHeader}>
                <span style={styles.gameName}>
                  {game.release.title || 'Unknown Title'}
                  {game.release.releaseYear && ` (${game.release.releaseYear})`}
                </span>
                <span style={styles.platform}>{game.platform}</span>
              </div>
              {game.release.developer && (
                <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {game.release.developer}
                </div>
              )}
              <div style={styles.fileInfo}>
                {game.files.map((file, index) => (
                  <span key={index}>
                    {file.path.split('/').pop()}
                    <span style={styles.fileSize}> ({formatFileSize(file.size)})</span>
                    {index < game.files.length - 1 ? '' : ''}
                  </span>
                ))}
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Action buttons */}
      {games.length > 0 && (
        <div style={styles.actionsRow}>
          <button
            style={{
              ...styles.secondaryButton,
              ...(hoverState.export ? styles.secondaryButtonHover : {})
            }}
            onClick={handleExport}
            onMouseEnter={() => handleButtonHover('export', true)}
            onMouseLeave={() => handleButtonHover('export', false)}
          >
            Export to YAML
          </button>
          <button
            style={{
              ...styles.secondaryButton,
              ...(hoverState.clear ? styles.secondaryButtonHover : {})
            }}
            onClick={clearResults}
            onMouseEnter={() => handleButtonHover('clear', true)}
            onMouseLeave={() => handleButtonHover('clear', false)}
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={{
            ...styles.spinner,
            animation: 'spin 1s linear infinite',
          }}></div>
          <div style={styles.loadingText}>Scanning for ROMs...</div>
          {scanProgress > 0 && (
            <div style={styles.scanCount}>
              Progress: {scanProgress}%
            </div>
          )}
        </div>
      )}

      {/* Add keyframe for spinner animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default RomScanner;