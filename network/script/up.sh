#!/usr/bin/env bash

C_RED="\033[31;01m"
C_GREEN="\033[32;01m"
C_YELLOW="\033[33;01m"
C_BLUE="\033[34;01m"
C_PINK="\033[35;01m"
C_CYAN="\033[36;01m"
C_NO="\033[0m"

LANGUAGE=${1:-"golang"}
CC_SRC_PATH=github.com/chaincode/ERC20/chaincode
set -e

################################################################################
###                                FUNCTIONS                                 ###
################################################################################

function up {
	docker-compose -f ./docker-compose.yml down
	docker-compose -f ./docker-compose.yml up -d ca.example.com orderer.example.com peer0.MEDSOS.example.com couchdb api.peer0.MEDSOS.example.com
	
	export FABRIC_START_TIMEOUT=10
	sleep ${FABRIC_START_TIMEOUT}
}

function createChannel {
	docker exec -e "CORE_PEER_LOCALMSPID=MEDSOSMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@MEDSOS.example.com/msp" peer0.MEDSOS.example.com peer channel create -o orderer.example.com:7050 -c ptwist -f /etc/hyperledger/configtx/channel.tx
}

function addPeers {
	docker exec -e "CORE_PEER_LOCALMSPID=MEDSOSMSP" -e "CORE_PEER_MSPCONFIGPATH=/etc/hyperledger/msp/users/Admin@MEDSOS.example.com/msp" peer0.MEDSOS.example.com peer channel join -b ptwist.block
}

function cli {
	docker-compose -f ./docker-compose.yml up -d cli
	
	docker exec -e "CORE_PEER_LOCALMSPID=MEDSOSMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/MEDSOS.example.com/users/Admin@MEDSOS.example.com/msp" cli peer chaincode install -n fabcar -v 1.0 -p "$CC_SRC_PATH" -l "$LANGUAGE"
	
	docker exec -e "CORE_PEER_LOCALMSPID=MEDSOSMSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/MEDSOS.example.com/users/Admin@MEDSOS.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C ptwist -n fabcar -l "$LANGUAGE" -v 1.0 -c '{"function": "init", "Args":["lol", "lol"]}' -P "OR ('MEDSOSMSP.member')"
	
	sleep 10
}

################################################################################
###                                   MAIN                                   ###
################################################################################

up
createChannel
addPeers
cli
