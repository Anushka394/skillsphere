const Orbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
    <div className="orb orb-purple" style={{ width: 600, height: 600, top: "-10%", left: "-10%" }} />
    <div className="orb orb-violet" style={{ width: 500, height: 500, top: "30%", right: "-15%" }} />
    <div className="orb orb-cyan"   style={{ width: 400, height: 400, bottom: "-10%", left: "30%" }} />
    <div className="orb orb-purple" style={{ width: 300, height: 300, top: "60%", left: "10%", animationDelay: "5s" }} />
  </div>
);

export default Orbs;
