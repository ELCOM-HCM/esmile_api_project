//  oracledb@2.3.0
const oracledb = require('oracledb');
 
function Connection() {
	var connect = null;
	var config =   {
		user          : "ESMILE",
	    password      : "ESMILE",
	    connectString : "172.16.9.201:1521/EODDB"
	
  }
  this.getConnection = (callback)=>{
	 if(connect != null){
		
	 }
	 oracledb.getConnection(config, (err, connection) => {
		 if (err) {
		      console.error(err.message);
		      return;
		}
		connection.execute("select * from ACCOUNT_CUS", (err, result)=>{
			console.log(result.rows)
		});
	 });
  }
}
 
module.exports = new Connection();