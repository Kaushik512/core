#
# Cookbook Name:: puppet_configure
# Recipe:: debian
#
# Copyright 2015, Relevance Lab INC
#
# All rights reserved - Do Not Redistribute
#

pup_config = node['puppet_configure']

include_recipe "apt"

include_recipe "puppet_configure::client_bootstrap"
