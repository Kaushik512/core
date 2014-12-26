package com.relevancelab.catalyst.security.ssh;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import com.jcraft.jsch.*;
import com.relevancelab.catalyst.security.ssh.exceptions.ConnectionClosedException;
import com.relevancelab.catalyst.security.ssh.exceptions.ConnectionNotInitializedException;

public class SSH {

	//ssh parameters
	String host;
	int port = 22;
	String username;
	String password;
	String pemFilePath; 

	//jsch variables
	InputStream stdOutInputstream;
	InputStream stdErrInputstream;
	JSch jsch;
	Session session;
	ChannelExec channel;

	/**
	 * 
	 * @param host
	 * @param port
	 * @param username
	 * @param password
	 * @param pemFilePath
	 */
	public SSH(String host,int port,String username,String password,String pemFilePath){
		System.out.println("In Constructor");
		this.host = host;
		this.port = port;
		this.username = username;
		if(password != null) {
			this.password = password;
		}
		if(pemFilePath != null) {
			this.pemFilePath = pemFilePath;
		}
	}

	/**
	 * 
	 * @param cmd
	 * @throws JSchException
	 * @throws IOException
	 */
	private int doSSh(String cmd) throws JSchException, IOException {
		System.out.println(host);
		System.out.println(port);
		System.out.println(username);
		System.out.println(password);
		System.out.println(pemFilePath);
		
		try {
			//making sure that only one connection is made at a time by an instance of this class. Need to think of better way
			if(jsch !=null && session != null && channel !=null) {
				return -1003;
			}

			String sudoCmd = "sudo"; 

			JSch.setConfig("StrictHostKeyChecking", "no");
			jsch=new JSch();
			if(pemFilePath != null) {
				System.out.println("Setting pem file");
				jsch.addIdentity(pemFilePath);
			}
			//enter your own EC2 instance IP here

			session=jsch.getSession(username, host, port);
			if(password != null) {
				System.out.println("Setting password");
				session.setPassword(password);
				sudoCmd = "echo "+password+" | sudo -S";
			}
			System.out.println("Session connecting");
			session.connect();
			//run stuff
			channel = (ChannelExec)session.openChannel("exec");
			System.out.println(sudoCmd+" "+cmd);
			channel.setCommand(sudoCmd+" "+cmd);
			channel.setInputStream(null);
			System.out.println("Getting stream");
			stdOutInputstream = channel.getInputStream();
			stdErrInputstream = channel.getErrStream();
			System.out.println("Connecting channel");
			channel.connect();
			System.out.println("Exit status "+channel.getExitStatus());
			return channel.getExitStatus();
		} finally {
			//Closing everything
			if (channel != null){ 
				channel.disconnect();
				channel = null;
			}
			if (session != null) {
				session.disconnect();
				session = null;
			}
			jsch = null;
		}
	}

	/**
	 * 
	 * @param runlist
	 * @param overrideRunlist
	 * @return
	 */
	public int execChefClient(String runlist,boolean overrideRunlist) {
		if(runlist == null || runlist.length() == 0){
			return -1002; //Need to think about the return codes
		}

		try {
			String cmd = "chef-client";
			if(overrideRunlist) {
				cmd += " -o";
			} else {
				cmd += " -r";
			}
			cmd += " "+runlist;
			return doSSh(cmd);
		} catch (JSchException | IOException e) {
			System.out.println("Exception Occured");
			//e.printStackTrace();
			e.printStackTrace();
			return -1001; /// need to think about it
		} 

	}

	public int execServiceCmd(String serviceName,String serviceAction) {
		if((serviceName == null || serviceName.length() == 0) || (serviceAction == null || serviceAction.length() == 0)){
			return -1002; //Need to think about the return codes
		}
		try {
			String cmd = "service "+serviceName + " " + serviceAction;
			return doSSh(cmd);
		} catch (JSchException | IOException e) {
			e.printStackTrace();
			return -1001; /// need to think about it
		}
	}

	public String getStdOutLogs() throws IOException, ConnectionNotInitializedException, ConnectionClosedException {
		BufferedReader br = null;
		if(jsch ==null || session == null || channel == null) {
			throw new ConnectionNotInitializedException("Connection not initialized");
		}
		if(stdOutInputstream == null)  {
		    throw new ConnectionNotInitializedException("Connection not initialized");
		}
		if(channel.isClosed()) {
			//stdOutInputstream.close(); // Do i need to close it explicitly 
			//stdOutInputstream = null;
			throw new ConnectionClosedException("Connection is closed");
		}
		try {
			br = new BufferedReader(new InputStreamReader(stdOutInputstream));
			String line = br.readLine();
			return line;
		}
		finally {
			if(br !=null) {
				br.close();
			}
		}
	 }
	
	public String getStdErrLogs() throws IOException, ConnectionNotInitializedException, ConnectionClosedException {
		BufferedReader br = null;
		
		if(jsch ==null || session == null || channel == null) {
			throw new ConnectionNotInitializedException("Connection not initialized");
		}
		if(stdErrInputstream == null)  {
		    throw new ConnectionNotInitializedException("Connection not initialized");
		}
		if(channel.isClosed()) {
			//stdErrInputstream.close(); // Do i need to close it explicitly 
			//stdErrInputstream = null;
			throw new ConnectionClosedException("Connection is closed");
		}

		try {
			br = new BufferedReader(new InputStreamReader(stdErrInputstream));
			String line = br.readLine();
			return line;
		}
		finally {
			if(br !=null) {
				br.close();
			}
		}
	 }
	
	public static void testMethodStatic() {
		System.out.println("In Static Method");
	}


}