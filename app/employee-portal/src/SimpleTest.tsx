import React from "react";

function SimpleTest() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>React App Test</h1>
      <p>This is a simple test to verify React is working.</p>
      <button onClick={() => alert("React is working!")}>Test Button</button>
    </div>
  );
}

export default SimpleTest;
