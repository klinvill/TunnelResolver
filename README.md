# TunnelResolver

Imported from https://github.com/klinvill/TunnelResolver

This is a quick and rough chrome extension I created that will allow you to make a list of hosts that your browser will automatically redirect. This was all done with the intention of making my work day a little easier. 

When working with a Hadoop cluster I didn't have direct network access to, I frequently had to tunnel into the cluster through a secured proxy. This ended up being a pain to work with several of the UIs (namely the resource manager) that various hadoop components provide. They would often forward me to a similar UI view on a different node. Since I was outside the cluster, I had to manually and frequently change the address it was sending me to. As a result, I decided to make an extension to do a simple redirection when I encountered an address I needed to change.