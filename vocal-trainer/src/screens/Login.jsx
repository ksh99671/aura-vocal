export default function Login({ onSignIn }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 32px",
    }}>
      {/* 아크 원 */}
      <svg width="160" height="160" viewBox="0 0 160 160" style={{marginBottom:32}}>
        <circle cx="80" cy="80" r="74" fill="none" stroke="rgba(201,169,110,0.06)" strokeWidth="0.5"/>
        <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(201,169,110,0.1)" strokeWidth="0.8"
          style={{transformOrigin:"80px 80px", animation:"breathe 5s ease-in-out infinite"}}/>
        <circle cx="80" cy="80" r="75" fill="none" stroke="rgba(201,169,110,0.35)" strokeWidth="1"
          strokeDasharray="40 18 8 230" strokeLinecap="round"
          style={{transformOrigin:"80px 80px", animation:"arc-slow 18s linear infinite"}}/>
        <circle cx="80" cy="80" r="52" fill="none" stroke="rgba(201,169,110,0.18)" strokeWidth="0.7"
          strokeDasharray="16 22" strokeLinecap="round"
          style={{transformOrigin:"80px 80px", animation:"arc-slow-rev 12s linear infinite"}}/>
        <circle cx="80" cy="80" r="38" fill="rgba(201,169,110,0.06)"
          style={{animation:"breathe 5s ease-in-out infinite"}}/>
        <circle cx="80" cy="80" r="22" fill="rgba(201,169,110,0.1)"
          style={{animation:"breathe2 4s ease-in-out infinite"}}/>
        <circle cx="80" cy="80" r="7" fill="rgba(201,169,110,0.5)"
          style={{animation:"glow-pulse 4s ease-in-out infinite"}}/>
      </svg>

      <p style={{fontSize:11, color:"var(--accent)", letterSpacing:".16em", textTransform:"uppercase", marginBottom:10, opacity:.8}}>
        Vocal Trainer
      </p>
      <h1 style={{fontSize:32, fontWeight:300, color:"var(--text1)", letterSpacing:"-.02em", marginBottom:8, textAlign:"center", lineHeight:1.2}}>
        <strong>Aura</strong>
      </h1>
      <p style={{fontSize:14, color:"var(--text2)", marginBottom:48, textAlign:"center", lineHeight:1.6}}>
        AI 발성 진단 + 레슨 관리 플랫폼
      </p>

      <button
        onClick={onSignIn}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--bg2)",
          border: "0.5px solid var(--border2)",
          borderRadius: 14,
          padding: "14px 24px",
          color: "var(--text1)",
          fontSize: 15,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          width: "100%",
          maxWidth: 320,
          justifyContent: "center",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,19.013,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Google로 시작하기
      </button>

      <p style={{fontSize:11, color:"var(--text3)", marginTop:24, textAlign:"center", lineHeight:1.6}}>
        트레이너 전용 앱입니다
      </p>
    </div>
  );
}
