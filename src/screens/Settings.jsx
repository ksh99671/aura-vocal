import NavBar from "../components/NavBar";
import { auth } from "../firebase";

export default function Settings({ go, logOut }) {
  const user = auth.currentUser;

  return (
    <div className="screen">
      <div style={{paddingTop:52, marginBottom:24}}>
        <p className="eyebrow">Settings</p>
        <h2 className="screen-title"><strong>설정</strong></h2>
      </div>

      <div className="result-card">
        <p className="card-label">계정</p>
        <p style={{fontSize:14, color:"var(--text1)", marginTop:6}}>{user?.email}</p>
        <button
          onClick={logOut}
          style={{
            marginTop:12, fontSize:13, color:"#e24b4a",
            background:"none", border:"none", padding:0,
            cursor:"pointer", fontFamily:"inherit"
          }}
        >
          로그아웃
        </button>
      </div>

      <NavBar go={go} active="settings" />
    </div>
  );
}
