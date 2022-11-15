/* pages/_app.js */
import '../styles/globals.css'
import Link from 'next/link'
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import styles from '../styles/Home.module.css';

function MyApp({ Component, pageProps }) {
  return (
    <div>
     <div>
     <Box sx={
            {flexGrow: 1}
        }>
            <AppBar position="static" className={styles.nav}>
                <Toolbar className={styles.navmenu}>

                    <Typography variant="h4" component="div" className={styles.team}
                        sx={
                            {flexGrow: 1}
                    }>
                        EY MARKETPLACE
                    </Typography>

                    <Link href="/">
                        <Button color="inherit" className={styles.homelink}>HOME</Button>
                    </Link>
                    <Link href="/create-nft">
                        <Button color="inherit" className={styles.homelink}>CREATE ITEM</Button>
                    </Link>
                    <Link href="/my-nfts">
                        <Button color="inherit" className={styles.homelink}>MY ITEMS</Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button color="inherit" className={styles.homelink}>DASHBOARD</Button>
                    </Link>




                </Toolbar>
            </AppBar>
      </Box> 
      
      
      <Component {...pageProps} />
    </div>
    </div>
    
    
  )
}

export default MyApp