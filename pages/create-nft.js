import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import { Button } from '@mui/material'
import styles from '../styles/Home.module.css';
import { TextField } from '@mui/material'
const projectId = '2HXs0OzTUFv18spRL6bNlgwFeA6';
const projectSecret = '6757ce344ac0060b2e68a82868eac96a';

const auth =
	  'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

const client = ipfsHttpClient({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth
        }
      })

import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()

  async function onChange(e) {
    const file = e.target.files[0]
    console.log("hemme",file)
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://gateway.ipfs.io/ipfs/${added.path}`
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput

    if (!name || !description || !price || !fileUrl) return
    /* first, upload to IPFS */
    
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://gateway.ipfs.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, return the URL to use it in the transaction */
      console.log(url,'hi')
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    console.log(url,'url')
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* next, create the item */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    console.log(listingPrice)
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()
   
    router.push('/')
  }

  return (
    <div>
      <div className={styles.form}>
        <TextField 
          placeholder="Item Name"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
          className={styles.text}
        />
        <TextField
          placeholder="Item Description"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
          className={styles.text}
        />
        <TextField
          placeholder="Item Price in ETH"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
          className={styles.text}
        />
        <Button variant='outlined' color="primary" className={styles.upload} component="label">Upload File<input hidden 
          type="file"
          name="Asset"
          onChange={onChange}
        /></Button>
        {
          fileUrl && (
            <img className={styles.upimage} width="350" src={fileUrl} />
          )
        }
        <Button onClick={listNFTForSale} variant="contained" color="success" className={styles.createbutton}>
          Create Item
        </Button>
      </div>
    </div>
  )
}