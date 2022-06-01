import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useSigner, useAddress, useDisconnect, useMetamask, useNFTCollection, useContract, useNFTs, useNFT } from '@thirdweb-dev/react';

import { supabase } from './supabaseClient';

import slugo from 'slugo';

import Select from './Select';

import create from 'zustand'

import toast, { Toaster } from 'react-hot-toast'

import { SiweMessage } from 'siwe';

import * as t from 'typed-assert';

const createSiweMessage = (address, statement) => {
  const message = new SiweMessage({
    domain: 'id.gosleek.xyz',
    address: address,
    statement: statement,
    uri: origin,
    version: '1',
    chainId: 1
  });
  return message.prepareMessage();
}

const useStore = create(set => ({
  profileId: '',
  setProfileId: (profileId: string) => set({ profileId }),
}))

import firstToSecond from './firstToSecond';

import NftCard from './NftCard';

const alchemyApiKey = 'uZ9aEl60QNgJuimr3mEHNQv33usHcaCY';
const alchemyBaseURL = `https://eth-mainnet.alchemyapi.io/v2/${alchemyApiKey}/getNFTMetadata`;

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

      console.dir(data);

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

        const metadataQueryUrl = `${alchemyBaseURL}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`;
        console.log(metadataQueryUrl);

        const v = await fetch(`
          ${metadataQueryUrl}
        `).then(res => res.json());
        console.dir(v);

        // try {
        //   t.isString(v.contract);
        // } catch (e: any) {
        //   return toast.error('Metadata error');
        // }

        // todo: transactions
        const response = await supabase.from('nfts').insert(data);
        console.log('nfts insert response', response);

        if (response.error) {
          return toast.error('Error importing token');
        }

        // todo: cloud function
        const metadata = {
          contract: v.contract.address,
          token_id: parseInt(v.id.tokenId),
          title: v.title,
          description: v.description,
          image_url: v.metadata.image,
          external_url: v.metadata.external_url,
          token_uri: v.tokenUri.raw,
          attributes: JSON.stringify(v.metadata.attributes),
          nft_id: response.data[0].id
        }
        const insertMetadataResponse = await supabase.from('metadata').insert(metadata);
        console.log('metadata insert response', insertMetadataResponse);

        if (insertMetadataResponse.error) {
          return toast.error('Error importing metadata');
        }

        toast.success('🚀 Success');
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

  const [location, setLocation] = useLocation();

  const [metadata, setMetadata] = useState<any>(null);

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

  useEffect(() => {
    console.log(location.split('/'))

    if (location.split('/')[1] == 'nft') {
      const metadataId = location.split('/')[2];

      console.log({ metadataId })

      if (metadataId) {
        const effect = async () => {
          const result = await supabase.from('metadata')
            .select('*')
            .eq('nft_id', metadataId)
            .single()

          if (result.data) {
            console.log('metadata', result.data);
            setMetadata(result.data);
          } else {
            console.log(result.error);
            toast.error('Metadata not found');
          }
        }
        effect();
      }
    }
  }, [location]);

  if (metadata && location.split('/')[1] == 'nft') {
    return <NftCard
      image={metadata.image_url.replace('ipfs://', 'https://cryptotaperecordings.mypinata.cloud/ipfs/')}
      title={metadata.title}
      description={metadata.description}
      id={metadata.contract}
      address={metadata.contract}
      attributes={JSON.parse(metadata.attributes)}
    />
  }

  return (
    <div className="flex flex-col">
      {
        nfts && nfts.map((token, index) => {
          return <div key={index} className="flex flex-row justify-start mx-8">
            <div className="my-2 bg-gray-600 p-4">
              <span className="">{token.contract_address.substring(0, 7)}...</span>
              <span className="">Token #{token.token_id}</span>
              <span className="mx-2"></span>
              <Link className="underline" href={`/nft/${token.id}`}>View</Link>
            </div>
          </div>
        })
      }
    </div>
  );
}

const styles = {
  appBlock: "bg-gray-700 w-screen h-screen text-white text-sm md:text-base lg:text-xl",
  blockRow: 'px-8 my-2 flex flex-row justify-start',
  first: "bg-gray-600 p-2",
  second: "p-2 underline"
}

// import KeyDidResolver from 'key-did-resolver';
import { getResolver } from '@ceramicnetwork/3id-did-resolver';

import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect';
import { CeramicClient } from '@ceramicnetwork/http-client';
import { DID } from 'dids'
import Web3Modal from 'web3modal'

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
})

const CERAMIC_URL = 'https://ceramic-clay.3boxlabs.com';

const threeIdEffect = async () => {
  console.log('frst')
  const ethProvider = await web3Modal.connect();
  console.log('second')
  const addresses = await ethProvider.enable();
  console.log('third', addresses)

  const authProvider = new EthereumAuthProvider(ethProvider, addresses[0]);

  const threeIdConnect = new ThreeIdConnect();

  await threeIdConnect.connect(authProvider);
  console.log('fourth');

  const ceramic = new CeramicClient(CERAMIC_URL);

  const didProvider = threeIdConnect.getDidProvider();
  console.log('didProvider', didProvider)

  // const keyDidResolver = KeyDidResolver.getResolver();
  // console.log('keyDidResolver', keyDidResolver)

  const threeIdResolver = getResolver(ceramic);
  console.log('threeIdResolver', threeIdResolver)

  const resolverRegistry = {
    ...threeIdResolver,
    // ...keyDidResolver
  };

  const did = new DID({
    provider: didProvider,
    resolver: resolverRegistry,
  });
  console.log('fifth');

  await did.authenticate();
  console.log('sixth')
  console.log('did', did);

  const jws = await did.createJWS({ data: 'Sleek App' });
  console.log('jws', jws);

  return { did, jws }
}

function MyProfile() {
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  const disconnectWallet = useDisconnect();
  const signer = useSigner();

  const [location, setLocation] = useLocation();
  const [name, setName] = React.useState('anonymous');
  const [slug, setSlug] = React.useState('');
  // const [nfts, setNfts] = React.useState<any[]>([]);
  const nameRef: any = React.createRef();

  const [signature, setSignature] = React.useState('');

  const [didValue, setDidValue] = React.useState(null);
  const [jwsValue, setJwsValue] = React.useState('');

  const { profileId, setProfileId } = useStore((state: any) => state);
  // const setProfileId = useStore((state: any) => state.setProfileId);

  useEffect(() => {
    // if(!slug && address) {
    //   setSlug(address);
    // }

    console.log(' got address ' + address);

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

          console.log(' got profile ' + result.data.id);

          setProfileId(result.data.id);

          // supabase.from('nfts')
          //   .select('*')
          //   .eq('profile_id', result.data.id)
          //   .then(nftResult => {
          //     if (nftResult.data) {
          //       console.log('supabase nfts', nftResult.data);
          //       setNfts([...nftResult.data]);
          //     }
          //   });
        } else {
          console.error('cannot find profile', result.error)
        }
      });
  }, [address, location]);

  const jwsRef = React.createRef();

  useEffect(() => {
    if (location.startsWith('/jws')) {
      if (location.split('/')[2] == 'sign') {
        const effect = async () => {
          t.isNotUndefined(jwsRef.current);
          t.isNotNull(jwsRef.current);
          const jwsMessage = jwsRef.current.value;
          console.log('jwsMessage', jwsMessage);
          t.isNotNull(didValue);
          const jwsSignature = await didValue.createJWS({ data: jwsMessage });
          setJwsValue(jwsSignature.signatures[0].signature.toString());
          setLocation('/');
        }
        effect();
      }
    } else if (location.startsWith('/did')) {
      threeIdEffect().then(({ did, jws }) => {
        setDidValue(did);
        if (jws.link) {
          setJwsValue(jws.link?.toString());
        }
      });
    } else if (location.startsWith('/sign')) {
      const effect = async () => {
        const message = createSiweMessage(
          address,
          'Sleek ID Profile',
        );
        const signature = await signer?.signMessage(message);
        if (signature) {
          setSignature(signature);
        }
      }
      effect();
    } else if (location.startsWith('/logout')) {
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
    <div className={styles.appBlock}>
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
          <div className={styles.blockRow}>
            <h1 className="bg-gray-600 p-2">
              {
                signature ? signature : 'Signature'
              }
            </h1>
            <Link href="/sign" className="p-2 underline">Create</Link>
          </div>
          <div className={styles.blockRow}>
            <h1 className={styles.first}>
              {
                didValue ? didValue.id : 'DID'
              }
            </h1>
            <Link href='/did' className={styles.second}>Create DID</Link>
          </div>
          <div className={styles.blockRow}>
            {
              location.startsWith('/jws') ?
                <TextField defaultValue='its me' href='/jws/sign' ref={jwsRef} />
                : <h1 className={styles.first}>
                  {
                    jwsValue ? jwsValue : 'JWS'
                  }
                </h1>
            }
            <Link href="/jws" className={styles.second}>Create Token</Link>
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

function ThreeIdApp() {
  const [didValue, setDidValue] = useState('');
  const [jwsValue, setJwsValue] = useState('');

  useEffect(() => {
    threeIdEffect().then(({ did, jws }) => {
      setDidValue(did.id);
      if (jws.link) {
        setJwsValue(jws.link?.toString());
      }
    });
  }, []);

  return <div className={styles.appBlock}>
    <div className="p-8">
      <h1 className="">Authorize with DID</h1>
    </div>
  </div>
}

function App() {
  const [location, setLocation] = useLocation();

  if (location.startsWith('/threeId')) {
    return <ThreeIdApp />
  } else if (location.startsWith('/0x')) {
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