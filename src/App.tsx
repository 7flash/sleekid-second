import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAddress, useDisconnect, useMetamask } from '@thirdweb-dev/react';

function App() {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  const [location, setLocation] = useLocation();
  const [name, setName] = React.useState('anonymous');
  const nameRef: any = React.createRef();

  useEffect(() => {
    const savedName = window.localStorage.getItem('name');
    if (savedName != null) {
      setName(savedName);
    }
  }, []);

  useEffect(() => {
    if (location.startsWith('/logout')) {
      disconnectWallet();
      setLocation('/');
    } else if (location.startsWith('/login')) {
      connectWithMetamask();
      setLocation('/');
    } else if (location.startsWith('/namify')) {
      if (location.split('/')[2]) {
        const newName = nameRef.current.value;
        setName(newName);
        window.localStorage.setItem('name', newName);
        setLocation('/');
      } else {
        nameRef.current.focus();
      }
    }
  }, [location]);

  return (
    <div className="bg-gray-700 w-screen h-screen text-white text-sm sm:text-base md:text-xl lg:text-2xl">
      {address ? (
        <div className="flex flex-col">
          <div className="px-8 my-4 flex flex-row justify-start">
            <h1 className="bg-gray-600 p-2">{address}</h1>
            <Link className="underline p-2" href="/logout">Disconnect Wallet</Link>
          </div>
          <div className="px-8 my-2 flex flex-row justify-start">
            {
              location.startsWith('/namify') ? (
                <>
                  <input className="bg-transparent border-2 px-2" defaultValue={name} ref={nameRef}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setLocation('/namify/save');
                      }
                    }}
                  />
                  <Link className="underline p-2" href="/namify/save">Save</Link>
                </>
              ) : (
                <>
                  <h1 className="bg-gray-600 p-2">{name}</h1>
                  <Link className="underline p-2" href="/namify">Edit Name</Link>
                </>
              )
            }
          </div>
        </div>
      ) : (
        <div className="p-8">
          <Link className="underline text-2xl" href="/login">Login with Metamask</Link>
        </div>
      )}
    </div>
  );
}

export default App;
