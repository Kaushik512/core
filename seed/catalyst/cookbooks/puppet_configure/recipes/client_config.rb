#
# Cookbook Name:: puppet_configure
# Recipe:: client_config
#
# Copyright 2015, Relevance Lab INC
#
# All rights reserved - Do Not Redistribute
#

pup_config = node['puppet_configure']

package 'puppet' do
	action :install
end

hostsfile_entry pup_config['puppet_master']['ipaddress'] do
	hostname lazy { pup_config['puppet_master']['fqdn']}
	unique true
	comment 'Update by puppet_configure cookbook'
	action :append
end

hostsfile_entry node['ipaddress'] do
	hostname lazy { Chef::Config[:node_name]}
	unique true
	comment 'Update by puppet_configure cookbook'
	action :append
end

file "/etc/hostname" do
	owner pup_config['user']
	group pup_config['group']
	mode 00644
	content lazy { Chef::Config[:node_name]}
	action :create
end

execute "Setting hostname" do
	user pup_config['user']
	group pup_config['group']
	command "hostname -F /etc/hostname"
	action :run
end

service "puppet" do
	action [:restart, :enable]
end
