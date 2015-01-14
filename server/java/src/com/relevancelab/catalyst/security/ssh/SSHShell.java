package com.relevancelab.catalyst.security.ssh;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.net.UnknownHostException;

import com.jcraft.jsch.ChannelShell;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.JSchException;
import com.jcraft.jsch.Session;

public class SSHShell {

	//ssh parameters
	private final int SSH_TIMEOUT = 60000;
	private String host;
	private int port = 22;
	private String username;
	private String password;
	private String pemFilePath; 


	// socket variables
	private int localSocketPort;
	private Socket socketClient = null;
	private OutputStream cmdReturnStream = null;
	private InputStream cmdStream  = null;




	//jsch variables
	JSch jsch;
	Session session = null;
	ChannelShell channel = null;

	public SSHShell(String host,int port,String username,String password,String pemFilePath,int localSocketPort){
		this.host = host;
		this.port = port;
		this.username = username;
		if(password != null) {
			this.password = password;
		}
		if(pemFilePath != null) {
			this.pemFilePath = pemFilePath;
		}
		this.localSocketPort = localSocketPort;
	}




	public void open() throws UnknownHostException, IOException, JSchException {

		//opening local socket
		socketClient = new Socket("localhost", localSocketPort);
		System.out.println("socket connected ==>" +socketClient.getRemoteSocketAddress());
		//getting streams
		cmdStream = socketClient.getInputStream();
		cmdReturnStream = socketClient.getOutputStream();
        
		JSch.setConfig("StrictHostKeyChecking", "no");
		jsch=new JSch();
		if(pemFilePath != null) {
			System.out.println("Setting pem file");
			jsch.addIdentity(pemFilePath);
		}
		session=jsch.getSession(username, host, port);
		if(password != null) {
			System.out.println("Setting password");
			session.setPassword(password);
		}
		System.out.println("Session connecting");
		session.connect(SSH_TIMEOUT);
		System.out.println("Session Connected");


		channel = (ChannelShell)session.openChannel("shell");
		channel.setPty(true);

		// setting streams 
		channel.setInputStream(cmdStream);
		channel.setOutputStream(cmdReturnStream);
		channel.connect();
		

	}

	public void close() throws IOException {
		//closing 		
		if (channel != null){ 
			System.out.println("channel disconnecting");
			channel.disconnect();
			channel = null;
		}
		if (session != null) {
			System.out.println("session disconnecting");
			session.disconnect();
			session = null;
		}
		jsch = null;
		if(socketClient != null) {
			System.out.println("closing socket");
			socketClient.close();
		}

	}

}
