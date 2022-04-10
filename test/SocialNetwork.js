const { assert } = require('chai');

const SocialNetwork = artifacts.require('./SocialNetwork.sol');

require('chai').use(require('chai-as-promised')).should()

contract('SocialNetwork', ([deployer, author, tipper])=>{
    let socialNetwork

    before(async()=>{
         // retrieve the deployed smart contract
         socialNetwork = await SocialNetwork.deployed();
    })

    describe('deployment',async ()=>{
        it('deploys successfully',async ()=>{
           
            // retrieve the address of smart contract
            const address = await SocialNetwork.address;
            // giving the constraints to address
            assert.notEqual(address, '0x0')
            assert.notEqual(address, '')
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        });

        it('has a name', async()=>{
            const name = await socialNetwork.name();
            // assert.equal(name, "EthBlog")
        })
    })

    describe('posts', async()=>{
        let result, postCount, post;

        before(async()=>{
            result = await socialNetwork.createPost('Body of Post',{from: author});
            postCount = await socialNetwork.postCount();
        })

        it('creates posts', async()=>{
            
            // // if post is created
            // assert.equal(postCount,0);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(), postCount.toNumber(),'Post Id is correct');
            console.log(event.id.toNumber());
            console.log(postCount.toNumber());
            console.log(event.content);
            console.log(event.tipAmount.toNumber());
            console.log(event.author);
            // if post is wrong
            result = await socialNetwork.createPost('', {from:author}).should.be.rejected;
        });

        it('lists posts', async()=>{
            const post = await socialNetwork.posts;
            console.log(post);
        });

        it('allow users to tip posts', async()=>{

            // previous balance of given address
            let oldAuthorBalance = await web3.eth.getBalance(author);
            oldAuthorBalance = new web3.utils.BN(oldAuthorBalance);

            result =  await socialNetwork.tipPost(postCount, {from:tipper, value: web3.utils.toWei('1', 'Ether')});
            
            const event = result.logs[0].args;
            console.log(event.id.toNumber());
            console.log(event.content);
            console.log(event.tipAmount);
            console.log(event.author);

            // current balance of the user
            let newAuthorBalance = await web3.eth.getBalance(author);
            newAuthorBalance = new web3.utils.BN(newAuthorBalance);

            // validation of the maount of post
            result = await socialNetwork.tipPost(99, {from:tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
        });

    })
})