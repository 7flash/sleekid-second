import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAddress, useDisconnect, useMetamask, useNFTCollection, useContract, useNFTs, useNFT } from '@thirdweb-dev/react';

import { supabase } from './supabaseClient';

import slugo from 'slugo';

import Select from './Select';

import create from 'zustand'

import toast, { Toaster } from 'react-hot-toast'

const useStore = create(set => ({
  profileId: '',
  setProfileId: (profileId: string) => set({ profileId }),
}))

function ViewProfile({ address, slug }: any) {
  const [name, setName] = React.useState('');
  const [profileAddress, setProfileAddress] = React.useState('');

  useEffect(() => {
    if (address) {
      setProfileAddress(address);

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
    } else if (slug) {
      supabase.from('profiles')
        .select('name, address')
        .eq('slug', slug)
        .single()
        .then(result => {
          if (result.data) {
            setName(result.data.name);
            setProfileAddress(result.data.address);
          } else {
            setName('deleted');
            setProfileAddress('');
          }
        });
    }
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
            <h1 className="bg-gray-600 p-2">{profileAddress}</h1>
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

const TextField = React.forwardRef(({ href, defaultValue }: any, ref: any) => {
  const [location, setLocation] = useLocation();

  return (
    <input type="text" className="bg-transparent px-2 border-2"
      defaultValue={defaultValue}
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          setLocation(href);
        }
      }}
      onBlur={(e) => {
        setLocation(href);
      }}
    />
  );
});

function ImportNft() {
  const [contractAddress, setContractAddress] = React.useState('0x64903fbd6eedaa7eeb5e79e24597a90e62a3de0c');
  const [tokenId, setTokenId] = React.useState('');
  const [location, setLocation] = useLocation();
  const [contractTokens, setContractTokens] = useState([]);

  const contractAddressInput = React.useRef<HTMLInputElement>(null);

  // const NFTContract = useNFTCollection('0x64903fbd6eedaa7eeb5e79e24597a90e62a3de0c');
  // const { data: nfts, isLoading, error } = useNFTs(NFTContract, { start: 0, count: 100 });

  const profileId = useStore((state: any) => state.profileId);

  useEffect(() => {
    console.log(location.split('/'))

    const route = location.split('/')[2];

    if (route == 'contractAddress') {
      if (location.split('/')[3] == 'save') {
        setContractAddress(contractAddressInput.current?.value as string);
        setLocation('/import');
      } else {
        contractAddressInput.current?.focus();
      }
    } else if (route == 'tokenId') {
      if (location.split('/')[3]) {
        setTokenId(location.split('/')[3]);
        setLocation('/import');
      }
    } else if (route == 'save') {
      const data = {
        contract_address: contractAddress,
        token_id: tokenId,
        profile_id: profileId
      };

      console.dir(data)

      const effect = async () => {
        const existing = await supabase.from('nfts')
          .select('*')
          .eq('contract_address', contractAddress)
          .eq('profile_id', profileId)
          .eq('token_id', tokenId)
          .maybeSingle()

        if (existing.error) {
          console.log('existing', existing);
          return toast.error('Token Already Imported');
        }

        const response = await supabase.from('nfts').insert(data)

        console.log('response', response);

        if (response.error) {
          return toast.error(response.error.message);
        }

        toast.success('Token Imported ' + response.data[0].token_id.toString());
      }
      effect();
    }
  }, [location, profileId]);

  useEffect(() => {
    const url = 'https://deep-index.moralis.io/api/v2/nft/CONTRACT_ADDRESS?chain=eth&format=decimal';
    fetch(url.replace('CONTRACT_ADDRESS', contractAddress), {
      method: 'GET',
      headers: {
        'X-API-Key': 'EN02OYLf1mF5hSSlyQd9oo5lMCfixnHfJVvztbxfH8LbZ8fSPOWNVedtl6dCjnL1'
      }
    }).then(res => res.json()).then(res => {
      if (res.result) {
        setContractTokens(res.result);
        setTokenId(res.result[0].token_id);
      } else {
        throw new Error('No NFTs found');
      }
    });
  }, [contractAddress]);

  // useEffect(() => {
  //   console.log('nfts', nfts);
  //   console.log('error', error);
  // }, [nfts, isLoading, error]);

  return (
    <div className="bg-gray-700 w-screen h-screen text-white text-sm sm:text-base md:text-xl lg:text-2xl">
      <div className="flex flex-col">
        <div className="px-8 my-4 flex flex-row justify-start">
          <span className="">Import NFT</span>
        </div>
        <div className="px-4 my-2 flex flex-row justify-start bg-gray-600 mx-8">
          <Link className="underline p-2" href="/import/contractAddress">Edit</Link>
          <span className="bg-gray-600 p-2">Contract Address</span>
          {
            location.split('/')[2] == 'contractAddress' && (
              <TextField href='/import/contractAddress/save' ref={contractAddressInput} defaultValue={contractAddress} />
            )
          }
          {
            location.split('/')[2] != 'contractAddress' && contractAddress &&
            <span className="bg-gray-500 p-2">{contractAddress}</span>
          }
          {
            location.split('/')[2] != 'contractAddress' && !contractAddress &&
            <span className="bg-gray-500 p-2 w-60"></span>
          }
        </div>
        <div className="px-4 flex flex-row justify-start bg-gray-600 mx-8">
          {
            contractAddress && <Link className="underline p-2" href="/import/tokenId">Choose</Link>
          }
          <span className="bg-gray-600 p-2">Token ID</span>
          {
            location.split('/')[2] == 'tokenId' && contractTokens && (
              <Select href='/import/tokenId' defaultValue={tokenId} options={
                contractTokens.map((token: any) => {
                  return `${token.symbol} - ${token.token_id}`;
                })
              } values={
                contractTokens.map((token: any) => {
                  return token.token_id;
                })
              } />
            )
          }
          {
            location.split('/')[2] != 'tokenId' && tokenId &&
            <span className="bg-gray-500 p-2">{tokenId}</span>
          }
          {
            location.split('/')[2] != 'tokenId' && !tokenId &&
            <span className="bg-gray-500 p-2 w-20"></span>
          }
        </div>
        <div className="px-8 my-4 flex flex-row justify-start">
          <Link href="/import/save" className="underline">Confirm</Link>
          <span className="px-4">|</span> 
          <Link href="/" className="underline">Cancel</Link>
        </div>
      </div>
    </div>
  );
}

function ProfileNfts() {
  const profileId = useStore((state: any) => state.profileId);

  const [nfts, setNfts] = useState<any[]>([]);

  useEffect(() => {
    const effect = async () => {
      const result = await supabase.from('nfts')
        .select('*')
        .eq('profile_id', profileId)

      toast.success('NFTs found ' + result.data?.length);
    
      console.log('nfts', result.data)
      
      if (result.data) {
        setNfts([...result.data]);
      }
    }
    effect();

  }, []);

  return (
    <div className="flex flex-col">
      {
        nfts && nfts.map((token, index) => {
          return <div className="flex flex-row justify-start mx-8">
            <div className="my-2 bg-gray-600 p-4">
              <span className="">{token.contract_address.substring(0, 7)}...</span>
              <span className="">Token #{token.token_id}</span>          
            </div>
          </div>
        })
      }
    </div>
  );
}

function MyProfile() {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();

  const [location, setLocation] = useLocation();
  const [name, setName] = React.useState('anonymous');
  const [slug, setSlug] = React.useState('');
  const nameRef: any = React.createRef();

  const { profileId, setProfileId } = useStore((state: any) => state);
  // const setProfileId = useStore((state: any) => state.setProfileId);

  useEffect(() => {
    // if(!slug && address) {
    //   setSlug(address);
    // }

    toast(' got address ' + address);

    supabase.from('profiles')
      .select('id, name, slug')
      .eq('address', address)
      .single()
      .then(result => {
        if (result.data) {
          console.log('supabase slug', result.data.slug);
          setName(result.data.name);

          if (result.data.slug) {
            setSlug(result.data.slug);
          }

          toast(' got profile ' + result.data.id);

          setProfileId(result.data.id);
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

        const slug = `${slugo(newName)}-${address?.substring(39)}`;

        supabase.from('profiles').upsert({
          address: address,
          name: newName,
          slug: slug
        }, {
          onConflict: 'address'
        }).then(console.log);
        //
        setLocation('/');
      } else {
        nameRef.current.focus();
      }
    } else if (location.startsWith('/import')) {

    }
  }, [location]);

  if (location.startsWith('/import')) {
    return <ImportNft />
  }

  return (
    <div className="bg-gray-700 w-screen h-screen text-white text-sm sm:text-base md:text-xl lg:text-2xl">
      {address ? (
        <div className="flex flex-col">
          <div className="px-8 my-4 flex flex-row justify-start">
            <h1 className="">My Profile</h1>
            <span className="px-2">|</span>
            {
              slug ? <a target="_blank" href={`/profile/${slug}`} className="underline">Share Link</a> :
                <a target="_blank" href={`/${address}`} className="underline">Share Link</a>
            }
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
          <div className="px-8 my-4 flex flex-row justify-start">
            <h1 className="">My NFTs</h1>
            <span className="px-2">|</span>
            {
              profileId && <Link className="underline" href="/import">Import</Link>
            }
          </div>
          {
            profileId && <ProfileNfts />
          }
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

  if (location.startsWith('/0x')) {
    return <ViewProfile address={location.split('/')[1]} />;
  } else if (location.startsWith('/profile')) {
    return <ViewProfile slug={location.split('/')[2]} />;
  } else {
    return <>
      <MyProfile />
      <Toaster />
    </>;
  }
}

export default App;