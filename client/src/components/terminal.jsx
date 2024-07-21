import { Terminal as XTerminal } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css'
import socket from '../socket';

const Terminal = () => {
    const termRef = useRef(null);

    useEffect(() => {
        const term = new XTerminal({
            rows: 20,
            cols: 80,  // Specify columns to avoid auto-sizing issues
        });

        if (termRef.current) {
            term.open(termRef.current);
        }

        term.onData(data => {
            console.log(data);
            socket.emit("terminal:write",data)
        });

        socket.on('terminal:data', (data)=>{
            term.write(data)
        })

    }, []);

    return (
        <div>
            <div ref={termRef} id="terminal" style={{ width: '100%', height: '100%' }} />
        </div>
    );
}

export default Terminal;
