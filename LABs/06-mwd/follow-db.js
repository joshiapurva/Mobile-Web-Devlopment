
function FollowDB() {
  var users = {}

  this.follow = function(user,follower) {
    users[user] = ( users[user] || {name:user} )
    users[user].followers = ( users[user].followers || [] ) 
    users[user].followers.push(follower)

    users[follower] = ( users[follower] || {name:follower} )
    users[follower].following = ( users[follower].following || [] ) 
    users[follower].following.push(user)
  }

  this.user = function(user){
    return users[user]
  }
}

module.exports = FollowDB
