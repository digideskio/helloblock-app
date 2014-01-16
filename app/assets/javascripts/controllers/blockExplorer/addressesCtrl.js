hbApp.controller( "blockExplorer/addressesCtrl", function( $scope, $routeParams, $location, HelloBlock ) {

  var defaultAddress = "mpjuaPusdVC5cKvVYCFX94bJX1SNUY8EJo"

  $scope.address = {
    base58: $routeParams.address || defaultAddress,
    transactions: [],
    unspents: []
  }

  var addressChannel = PusherClient.subscribe( 'addresses' );

  // Callback: Lvl 1
  HelloBlock.Addresses.get( {
    address: $scope.address.base58,
    limit: 100,
    offset: 0
  }, function( res ) {

    $scope.address = $.extend( {}, $scope.address, res.data.address );

    var unspents_tx_hashes = $scope.address.unspents.map( function( i ) {
      return i.tx_hash;
    } )

    // Callback: Lvl 2
    HelloBlock.Transactions.get( {
      "tx_hash[]": unspents_tx_hashes
    }, function( res ) {

      $scope.address.unspent_transactions = res.data.transactions

    }, function( err ) {
      console.log( "error!", err )
    } )

    // Callback: Lvl 2
    addressChannel.bind( $scope.address.base58, function( res ) {
      Pusher.beep();

      var tx = res.message

      $scope.$apply( function() {
        $scope.address.transactions.unshift( tx )
      } )
    } );

  }, function( err ) {
    console.log( "error!", err )
    $location.path( '/testnet/' )
  } )

  // Infinite Scrolling

  $scope.limitTo = {
    transactions: 5,
    unspents: 5
  }

  $scope.offset = {
    transactions: 100,
    unspents: 100
  }

  $scope.loadMoreTransactions = function() {
    $scope.limitTo.transactions += 5

    if ( $scope.limitTo.transactions >= $scope.offset.transactions ) {

      // Callback: Lvl 1
      HelloBlock.AddressTransactions.get( {
        address: $scope.address.base58,
        limit: 100,
        offset: $scope.limitTo.transactions
      }, function( res ) {
        $scope.address.transactions.push( res.data.transactions )

        $scope.offset.transactions = $scope.limitTo.transactions
        $scope.offset.transactions += 100
      }, function( err ) {
        console.log( err )
      } )
    }
  }

  $scope.loadMoreUnspents = function() {
    $scope.limitTo.unspents += 5

    if ( $scope.limitTo.transactions >= $scope.offset.transactions ) {

      // Callback: Lvl 1
      HelloBlock.AddressUnspents.get( {
        address: $scope.address.base58,
        limit: 100,
        offset: $scope.limitTo.unspents
      }, function( res ) {

        var unspents_tx_hashes = res.unspents.map( function( i ) {
          return i.tx_hash;
        } )

        // Callback: Lvl 2
        HelloBlock.Transactions.get( {
          "tx_hash[]": unspents_tx_hashes
        }, function( res ) {

          $scope.address.unspent_transactions.push( res.data.transactions )
          $scope.offset.unspents = $scope.limitTo.unspents
          $scope.offset.unspents += 100

        }, function( err ) {
          console.log( "error!", err )
        } )
      }, function( err ) {
        console.log( err )
      } )
    }
  }

  $scope.$on( "$destroy", function() {
    PusherClient.unsubscribe( "addresses" )
  } )

} )
