#
# Cookbook Name:: puppet_configure
# Recipe:: default
#
# Copyright 2015, Relevance Lab INC
#
# All rights reserved - Do Not Redistribute
#

default['puppet_configure']['user'] = "root"
default['puppet_configure']['group'] = "root"
default['puppet_configure']['cache_dir'] = "/var/chef/cache"
default['puppet_configure']['packages'] = ["unzip", "wget", "sshpass"]
# default['puppet_configure']['epel_repo_url'] = "http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm"
default['puppet_configure']['ssh_rpm'] = "http://pkgs.repoforge.org/sshpass/sshpass-1.05-1.el6.rf.x86_64.rpm"


default['puppet_configure']['client']['user'] = "vagrant"
default['puppet_configure']['client']['pswd'] = "vagrant"
default['puppet_configure']['client']['ipaddress'] = "172.28.128.5"
default['puppet_configure']['client']['fqdn'] = "puppetclient-us-east-1.ec2.internal"
default['puppet_configure']['client']['ssh_pass_method'] = true
default['puppet_configure']['client']['pem_file'] = ""

default['puppet_configure']['puppet_master']['user'] = "vagrant"
default['puppet_configure']['puppet_master']['pswd'] = "vagrant"
default['puppet_configure']['puppet_master']['ipaddress'] = "172.28.128.5"
default['puppet_configure']['puppet_master']['fqdn'] = "puppetmaster-us-east-1.ec2.internal"
default['puppet_configure']['puppet_master']['ssh_pass_method'] = true
default['puppet_configure']['puppet_master']['pem_file'] = ""
