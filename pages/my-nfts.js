import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import { Button, Grid } from '@mui/material';
import styles from '../styles/Home.module.css';
import Image from 'next/image'
import { Alert } from '@mui/material';
import { FaEthereum } from 'react-icons/fa';

import { Card,CardMedia,CardContent,CardActions,Typography } from '@mui/material';
import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        name: meta.data.name,
        image: meta.data.image,
        description: meta.data.description,
        tokenURI
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  function listNFT(nft) {
    console.log('nft:', nft)
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }
  if (loadingState === 'loaded' && !nfts.length) return (<Alert variant="outlined" severity="info" className={styles.alert}>
  No items Owned
</Alert>)
  return (
    <div >
      <Alert variant="filled" severity="success" className={styles.alert}>
 Items which are owned by you will be displayed here. You can resell the item by updating the price if you want
</Alert>
      <div className={styles.cont}>
        <div >
          {
            nfts.map((nft, i) => (
              <div key={i}>
              <Card sx={
              {
                  maxWidth: "300px",
                  bgcolor: "#fff",
                  marginTop: "20px",
                  marginRight: "60px",
                  marginBottom: "40px"
              }
          }
          className="anime-card">
         
              <CardMedia component="img" className={styles.cardimg}
                  image={
                      nft.image
                  }
                  height="100%"
                  />
              <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                      {
                      nft.name
                  } </Typography>
                  <Typography color="text.secondary">
                        {nft.description}
                    </Typography>
              </CardContent>
              <CardActions sx={
                  {alignItems: "right"}
              }>
                  <div className={styles.price}><FaEthereum className={styles.inline}/> {
                      nft.price
                  } ETH &nbsp;</div>
              
              </CardActions>
              <Button variant="contained" color="error" onClick={() => listNFT(nft)} className={styles.buynow}>List Now</Button>
      </Card>
            </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}