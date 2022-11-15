import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Box from '@mui/material/Box';
import { Button, Grid } from '@mui/material';
import styles from '../styles/Home.module.css';
import Image from 'next/image'
import { Alert } from '@mui/material';
import Link from 'next/link';
import { FaEthereum } from 'react-icons/fa';

import {
  marketplaceAddress
} from '../config'
import { Card,CardMedia,CardContent,CardActions,Typography } from '@mui/material';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)
    const data = await contract.fetchMarketItems()

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  
  return (

    
    <div>
      <div><Box className={styles.header}>
    <Grid container spacing={2}>
    <Grid item xs={8}>
    <p className={styles.create}>Create, Sell and Buy</p>
    <p className={styles.desc}>Ey Marketplace where users can sell and buy digital assets using ethereum. Lorem ipsum dolor sit amet. Sit sunt itaque et perspiciatis velit ut error officia aut eveniet corrupti sit architecto doloribus.</p>
    <p className={styles.desc1}>What are you wiating for, Start Now !</p>
    <Link href="/create-nft"><Button variant="contained" color='error' className={styles.start}>Start Now</Button></Link>
    </Grid>
    <Grid item xs={4}>
      <Image src="/1.svg" height={300} width={400}/>
    </Grid>
    </Grid>
    </Box>
    
    </div>
    {loadingState === 'loaded' && !nfts.length ? <Alert variant="outlined" severity="warning" className={styles.alert}>
  No items in the Marketplace 
</Alert> : <div >
      <div>
        <div className={styles.cont} >
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
                    alt={
                        nft.name
                    }/>
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
                <Button variant="contained" color="success" onClick={() => buyNft(nft)} className={styles.buynow}>Buy Now</Button>
        </Card>
              </div>
            ))
          }
        </div>
      </div>
    </div>}
    
    </div>
  )
}

