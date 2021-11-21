import React from 'react';

const WS_URL = 'ws://localhost:8001';

const instructions = [
  {
    moduleId: 1,
    instruction: 'SET_MOTOR_SPEED',
    param: 30, // 0 - 100
    category: 'MOTOR',
    device: 'MOTOR_1',
  },
  {
    moduleId: 1,
    instruction: 'SET_TEMPERATURE',
    param: 27,
    category: 'TEMPERATURE',
    device: 'TEMP_1',
  },
  {
    moduleId: 1,
    instruction: 'SET_FREQ',
    param: 100, // 0 - 500
    category: 'MOTOR',
    device: 'MOTOR_1',
  },
  {
    moduleId: 1,
    instruction: 'ACCEL_TIME', // time to accelerate up to target speed (seconds)
    param: 3,
    category: 'MOTOR',
    device: 'MOTOR_1',
  },
  {
    moduleId: 1,
    instruction: 'DECEL_TIME', // time to decelerate (seconds)
    param: 2,
    category: 'MOTOR',
    device: 'MOTOR_1',
  },
  {
    moduleId: 1,
    instruction: 'SET_TIMER', // value 0 menas no timer - endless operation until stopped manually (minutes)
    param: 0,
    category: 'MOTOR',
    device: 'MOTOR_1',
  },
];

function App() {
  const [instruction, setInstruction] = React.useState(instructions[0]);
  const [visible, setVisible] = React.useState(false);
  const ws = React.useRef(null);

  React.useEffect(() => {
    ws.current = new WebSocket(WS_URL);
    ws.current.onmessage = (e) => {
      console.log(e.data);
    };
  }, []);

  function sendInstruction() {
    console.log(JSON.stringify(instruction, null, 4));

    const data = { ...instruction, isMaster: true };
    ws.current.send(JSON.stringify(data));
    setVisible(true);
    setTimeout(() => setVisible(false), 1300);
  }

  return (
    <div
      className="App"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <div className="buttons" style={{ display: 'flex' }}>
        {instructions.map((instr) => {
          return (
            <button
              key={instr.instruction}
              onClick={() => setInstruction(instr)}
            >
              {instr.instruction}
            </button>
          );
        })}
      </div>

      <textarea
        className="instruction"
        rows="10"
        cols="80"
        id="TITLE"
        value={JSON.stringify(instruction, null, 2)}
        onChange={(e) => setInstruction(JSON.parse(e.target.value))}
      />

      <button onClick={() => sendInstruction()}>Send instruction</button>

      <div
        style={{
          color: 'green',
          fontWeight: 'bold',
          transition: 'opacity 0.5s ease-in-out',
          opacity: visible ? 1 : 0,
        }}
      >
        Sent!
      </div>
    </div>
  );
}

export default App;
