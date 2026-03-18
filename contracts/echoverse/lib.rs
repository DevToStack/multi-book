// contracts/echoverse/lib.rs
#![cfg_attr(not(feature = "std"), no_std)]

use ink::prelude::string::String;
use ink::prelude::vec::Vec;
use ink::storage::Mapping;
use scale::{Decode, Encode};

#[ink::contract]
mod echoverse {
    #[ink(storage)]
    pub struct EchoVerse {
        posts: Mapping<u64, Post>,
        user_posts: Mapping<AccountId, Vec<u64>>,
        mirrors: Mapping<u64, Vec<Mirror>>,
        post_count: u64,
    }

    #[derive(Encode, Decode, Debug, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Post {
        pub id: u64,
        pub owner: AccountId,
        pub content_cid: String, // IPFS CID
        pub media_cid: Option<String>,
        pub timestamp: u64,
        pub post_type: PostType,
    }

    #[derive(Encode, Decode, Debug, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Mirror {
        pub node_id: String,
        pub cid: String,
        pub timestamp: u64,
        pub active: bool,
    }

    #[derive(Encode, Decode, Debug, Clone)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum PostType {
        Text,
        Image,
        Video,
    }

    impl EchoVerse {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                posts: Mapping::new(),
                user_posts: Mapping::new(),
                mirrors: Mapping::new(),
                post_count: 0,
            }
        }

        #[ink(message)]
        pub fn create_post(&mut self, content_cid: String, media_cid: Option<String>, post_type: PostType) -> u64 {
            let caller = self.env().caller();
            let post_id = self.post_count;
            
            let post = Post {
                id: post_id,
                owner: caller,
                content_cid,
                media_cid,
                timestamp: self.env().block_timestamp(),
                post_type,
            };

            self.posts.insert(post_id, &post);
            
            // Update user's post list
            let mut user_post_list = self.user_posts.get(&caller).unwrap_or_default();
            user_post_list.push(post_id);
            self.user_posts.insert(caller, &user_post_list);
            
            self.post_count += 1;
            post_id
        }

        #[ink(message)]
        pub fn add_mirror(&mut self, post_id: u64, node_id: String, cid: String) {
            let mut mirror_list = self.mirrors.get(post_id).unwrap_or_default();
            mirror_list.push(Mirror {
                node_id,
                cid,
                timestamp: self.env().block_timestamp(),
                active: true,
            });
            self.mirrors.insert(post_id, &mirror_list);
        }

        #[ink(message)]
        pub fn get_post(&self, post_id: u64) -> Option<Post> {
            self.posts.get(post_id)
        }

        #[ink(message)]
        pub fn get_user_posts(&self, account: AccountId) -> Vec<u64> {
            self.user_posts.get(&account).unwrap_or_default()
        }

        #[ink(message)]
        pub fn get_mirrors(&self, post_id: u64) -> Vec<Mirror> {
            self.mirrors.get(post_id).unwrap_or_default()
        }
    }
}