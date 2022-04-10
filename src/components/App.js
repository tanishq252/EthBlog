import React, { Component} from 'react';
import l from '../l.png';
import Web3 from 'web3';
import './App.css';
import Identicon from 'identicon.js';
import SocialNetwork from '../abis/SocialNetwork.json';

class App extends Component {

  /////contrsuctor
  constructor(props){
    super(props)
    this.state = {
      account: '',
      socialNetwork: null,
      postCount: 0,
      posts: [],
      loading:true
    }

    this.tipPost = this.tipPost.bind(this);
    this.createPost = this.createPost.bind(this);

  }

  createPost(content){
    this.setState({loading: true})
    this.state.socialNetwork.methods.createPost(content).send({from: this.state.account}).once('receipt',(receipt)=>{
      this.setState({loading: false})
    })

    setTimeout(()=>{this.setState({loading: false})}, 10000);

  }


  tipPost(id, tipAmount){
    this.setState({loading: true})
    this.state.socialNetwork.methods.tipPost(id).send({from: this.state.account, value: tipAmount})
    .once('receipt',(receipt)=>{
      this.setState({loading: false})
    })

  }

  /////////////////////////////////////////method1 to connect the dapp with the ethereum accounts
  // // to connect react with frontend
  async componentWillMount(){
      await this.loadWeb3();
      await this.loadBlockchainData();
      // await this.connectWallet();
  }

  // // to connect the metamask extension with frontend and smart contract we deployed web3 is going to be used
  async loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable()
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.curretProvider())
    }
    else{
      window.alert("Non ethereuem browser");
    }
  }
  
  // load blockchain data
  async loadBlockchainData(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    // Request account access if needed
    // console.log(accounts);
    this.setState({account:accounts[0]});
    // networkId
    const networkId = await web3.eth.net.getId();
    console.log(`the netID : ${networkId}`);
    console.log(SocialNetwork.networks[networkId]);;
    const netData = SocialNetwork.networks[networkId];
    if(netData){
      // fetch the smartcontract from the network id of ganache blockchain and set the contract of website to fetched contract
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, netData.address);
      this.setState({socialNetwork});
      const postCount = await socialNetwork.methods.postCount().call();
      this.setState({postCount});

      for(var i=1;i<=postCount;i++){
        const post = await socialNetwork.methods.posts(i).call()
        this.setState({
          // addds the fetched post to end of the array
          posts: [...this.state.posts, post]
        })
        this.setState({
          posts: this.state.posts.sort((a,b)=>b.tipAmount-a.tipAmount)
        })
        this.setState({loading:false})
        console.log(this.state.posts);
      }
      
    }else{
      window.alert("Network ID is not proper")
    }
    // SocialNetwork.networks[networkId];
    // retrieving address form abi

    
  }


  /////////////////////////////////////////method2 to connect the dapp with ethereum accounts

  // async connectWallet(){
  //   try {
  //     const { ethereum } = window;

  //     if (!ethereum) {
  //       alert("Please install MetaMask!");
  //       return;
  //     }

  //     const accounts = await ethereum.request({
  //       method: "eth_requestAccounts",
  //     });

  //     console.log("Connected", accounts[0]);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  


  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            EthBlog
          </a>
          
        <span>
        <small className='navbar-brand1' >User: {this.state.account}</small>
        {this.state.account?
          
          <img className='image' width='30' height='30' src = {`data:image/png;base64,${new Identicon(this.state.account, 30).toString()}`}/>:<span/>
        }
        </span>
            
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                  <img src={l} height="130" alt='logo'/>
                <h3>A decentralized blogging platform for content creators</h3>
              </div>
            </main>
          </div>
        </div>
        <div className='form-group'>
          <p>&nbsp;</p>
          <form onSubmit={(e)=>{
            e.preventDefault()
            this.createPost(this.postContent.value)
          }}>
            <input ref={(input)=>{this.postContent = input}} id='postCount' type="text" className='form-control' placeholder='Enter your content here!'/>
            <br></br>
            <button className='btn1' type='submit'>
              Submit
            </button>
          </form>
          <p>&nbsp;</p>
          
        </div>
        {this.state.loading?
        <div id = "loader" className='text-center mt-5'><p>Loading...</p></div>
            :
        <div>
          <main role="main" className="col-lg-12 ml-auto mr-auto">
            {this.state.posts.map((post, key)=>{
            return(
              <div class="card" width="20" key={key}>
                <div class="card-body">
                <span>
                  <row>
                  <h5 class="card-title">
                  <img className='imageHead' width='30' height='30' src = {`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}/>

                    <div className='head'>{post.author}</div>
                    </h5>
                  </row>
                </span>
                  <hr></hr>
                  <p class="card-text">{post.content}</p>
                  <hr></hr>
                  <span key={key} className="float-left mt-1 text-muted">
                    TIP: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')}
                  </span>
                  <button 
                  name={post.id}
                  onClick={(event)=>{
                    event.preventDefault();
                    let tipAmount = window.web3.utils.toWei('0.1', 'Ether')

                    this.tipPost(event.target.name, tipAmount)
                  }}
                  className='btn btn-link btn-sm float-right pt-0'>
                      TIP: 0.1ETH
                  </button>
                </div>
              </div>
            )
          })}
          </main>
          
        </div>
      }
      </div>
    );
  }
}

export default App;
