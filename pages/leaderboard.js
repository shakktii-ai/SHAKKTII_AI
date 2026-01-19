// pages/leaderboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Leaderboard.module.css';

const Leaderboard = ({ user }) => {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.email) {
      router.push('/login');
    } else {
      fetchLeaderboard();
    }
  }, [user, router]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/leaderboard?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      
      const data = await response.json();
      setLeaderboard(data.top10 || []);
      setUserRank(data.userRank);
      
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError(error.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedal = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Leaderboard | SHAKKTII AI</title>
        <meta name="description" content="View your ranking among all users" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Leaderboard</h1>
        
        {loading ? (
          <div className={styles.loading}>Loading leaderboard...</div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchLeaderboard} className={styles.retryButton}>
              Retry
            </button>
          </div>
        ) : (
          <div className={styles.leaderboardContainer}>
            {/* Top 10 Leaderboard */}
            <h2 className={styles.sectionTitle}>Top 10 Performers</h2>
            <div className={styles.leaderboardHeader}>
              <div className={styles.rankHeader}>Rank</div>
              <div className={styles.userHeader}>User</div>
              <div className={styles.scoreHeader}>Score</div>
            </div>
            
            {leaderboard.length === 0 ? (
              <div className={styles.noData}>No data available</div>
            ) : (
              leaderboard.map((entry) => (
                <div 
                  key={entry.userId} 
                  className={`${styles.leaderboardRow} ${entry.email === user.email ? styles.currentUser : ''}`}
                >
                  <div className={styles.rank}>
                    <span className={styles.rankMedal}>
                      {getMedal(entry.rank)}
                    </span>
                  </div>
                  <div className={styles.userInfo}>
                    {entry.profileImg ? (
                      <img 
                        src={entry.profileImg} 
                        alt={entry.fullName} 
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {entry.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className={styles.userDetails}>
                      <div className={styles.userName}>
                        {entry.fullName || 'Anonymous User'}
                        {entry.email === user.email && ' (You)'}
                      </div>
                      <div className={styles.userEmail}>{entry.email}</div>
                    </div>
                  </div>
                  <div className={styles.score}>
                    <div className={styles.scoreValue}>
                      {entry.totalScore?.toFixed(1) || '0.0'}
                      <span className={styles.scoreOutOf}>/10</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Current User's Rank */}
            {userRank && !leaderboard.some(entry => entry.email === user.email) && (
              <>
                <h2 className={styles.sectionTitle} style={{ marginTop: '2rem' }}>Your Rank</h2>
                <div className={`${styles.leaderboardRow} ${styles.currentUser}`}>
                  <div className={styles.rank}>
                    <span className={styles.rankMedal}>
                      #{userRank.rank}
                    </span>
                  </div>
                  <div className={styles.userInfo}>
                    {userRank.profileImg ? (
                      <img 
                        src={userRank.profileImg} 
                        alt={userRank.fullName} 
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {userRank.fullName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className={styles.userDetails}>
                      <div className={styles.userName}>
                        {userRank.fullName || 'You'}
                        <span style={{ marginLeft: '0.5rem' }}>(You)</span>
                      </div>
                      <div className={styles.userEmail}>{userRank.email}</div>
                    </div>
                  </div>
                  <div className={styles.score}>
                    <div className={styles.scoreValue}>
                      {userRank.totalScore?.toFixed(1) || '0.0'}
                      <span className={styles.scoreOutOf}>/10</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;