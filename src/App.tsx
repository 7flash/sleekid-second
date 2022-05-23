import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAddress, useDisconnect, useMetamask } from '@thirdweb-dev/react';

import { supabase } from './supabaseClient';

function ViewProfile({ address }: any) {
  const [name, setName] = React.useState('');

  useEffect(() => {
    supabase.from('profiles')
      .select('name')
      .eq('address', address)
      .single()
      .then(result => {
        if (result.data) {
          setName(result.data.name);
        } else {
          setName('deleted');
        }
      });
  }, []);

  return (
    <div className="bg-gray-700 w-screen h-screen text-white text-sm sm:text-base md:text-xl lg:text-2xl">
      {(
        <div className="flex flex-col">
          <div className="px-8 my-4 flex flex-row justify-start">
            {
              <h1 className="">View Profile</h1>
            }
          </div>
          <div className="px-8 my-2 flex flex-row justify-start">
            <h1 className="bg-gray-600 p-2">{address}</h1>
              <h1 className="p-2">Address</h1>
          </div>
          <div className="px-8 my-2 flex flex-row justify-start">
            {(
                <>
                  <h1 className="bg-gray-600 p-2">{name}</h1>
                  <h1 className="p-2">Profile Name</h1>
                </>
              )
            }
          </div>
        </div>
      )}
    </div>
  );

}

function MyProfile() {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  const [location, setLocation] = useLocation();
  const [name, setName] = React.useState('anonymous');
  const nameRef: any = React.createRef();

  useEffect(() => {
    supabase.from('profiles')
      .select('name')
      .eq('address', address)
      .single()
      .then(result => {
        if (result.data) {
          console.log('supabase name', result.data.name);
          setName(result.data.name);
        } else {
          console.error('cannot find profile', result.error)
        }
      });
  }, [address]);

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
        // window.localStorage.setItem('name', newName);
        supabase.from('profiles').upsert({
          address: address,
          name: newName,
        }, {
          onConflict: 'address'
        }).then(console.log);
        //
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
            <h1 className="">My Profile</h1>
            <span className="px-2">|</span>
            <a target="_blank" href={`/${address}`} className="underline">Share Link</a>
          </div>
          <div className="px-8 my-2 flex flex-row justify-start">
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

function App() {
  const [location, setLocation] = useLocation();

  return (
    location.startsWith('/0x') ? (
      <ViewProfile address={location.split('/')[1]} />
    ) : (
      <MyProfile />
    )
  );
}

export default App;
