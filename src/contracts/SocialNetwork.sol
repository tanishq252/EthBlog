pragma solidity >=0.4.21 <0.6.0;

contract SocialNetwork{
    string public name; 

    uint public postCount = 0;

    mapping(uint=>Post) public posts;

    struct Post{
        uint id;
        string content;
        uint tipAmount;
        address payable author;
    }

    event PostCreated(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );
    
    event PostTipped(
        uint id,
        string content,
        uint tipAmount,
        address payable author
    );

    constructor() public{
        name = "Post Created";
    }

    function createPost(string memory _content) public{
        //require valid content
        require(bytes(_content).length > 0);
        //incrementing posts
        postCount++;
        //adding posts to the list of posts
        posts[postCount] = Post(postCount, _content, 0, msg.sender);
        //trigger event
       emit PostCreated(postCount, _content, 0, msg.sender);
    }

    function tipPost(uint _id) public payable{
        //validate the id
        require(_id>0 && _id<=postCount);
        // fetch the post based on id and increment the tip amount of the desired author
        Post memory _p = posts[_id];
        address payable _author = _p.author;
        // transfer the amount of paid ether to author
        address(_author).transfer(msg.value);
        // increment tip amount reflected on website
        _p.tipAmount+= msg.value;
        // update the post with incremented tip amount
        posts[_id] = _p;
        emit PostTipped(_id, _p.content, _p.tipAmount, _author);
    }
}