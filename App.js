import React, { useState, useEffect, useRef, useMemo } from "react";
import LottieView from "lottie-react-native";
import {
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AntDesign from "react-native-vector-icons/AntDesign";

// COMPONENT ITEM
const Item = ({ item, isSaved, handleSavePress }) => (
  <View
    style={{
      backgroundColor: "#1f1f1f",
      padding: 10,
      marginVertical: 10,
      borderRadius: 10,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <View style={{ alignSelf: "center", flexDirection: "row" }}>
        <Image
          source={item.iconUrl}
          style={{ width: 30, height: 30, alignSelf: "center" }}
        />
        <View style={{ marginLeft: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "500", color: "white" }}>
            {item.name}
          </Text>
          <Text style={{ textTransform: "uppercase", color: "white" }}>
            {item.symbol}
          </Text>
        </View>
      </View>
      <View>
        <Text style={{ color: "white" }}>${item.priceUsd}</Text>
      </View>
      <TouchableOpacity
        style={{ alignItems: "flex-end" }}
        onPress={() => handleSavePress(item)}
      >
        <AntDesign
          name={isSaved ? "star" : "staro"}
          size={24}
          color={isSaved ? "yellow" : "white"}
        />
      </TouchableOpacity>
    </View>
  </View>
);

export default function App() {
  // STATE COIN FOR LIST OF COIN
  const [coin, setCoin] = useState([]);
  //STATE FOR WATCHLIST MODAL
  const [modalVisible, setModalVisible] = useState(false);
  //STATE FOR WATCHLIST
  const [watchlist, setWatchlist] = useState([]);
  //STATE FOR LOADING BEFORE FETCH
  const [isLoading, setIsLoading] = useState(true);

  // FUNCTION FETCH WATCHLIST WITH ASYNCSTORAGE
  const fetchWatchlist = async () => {
    try {
      const savedWatchlist =
        JSON.parse(await AsyncStorage.getItem("watchlist")) || [];
      setWatchlist(savedWatchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [modalVisible]);

  // FUNCTION CLOSE MODAL
  const closeModal = () => {
    setModalVisible(false);
  };

  // FUNCTION SAVE TO WATCHLIST WITH ASYNCSTORAGE
  const handleSavePress = async (item) => {
    try {
      const savedWatchlist =
        JSON.parse(await AsyncStorage.getItem("watchlist")) || [];
      const isAlreadySaved = savedWatchlist.some(
        (coin) => coin.symbol === item.symbol
      );

      if (!isAlreadySaved) {
        savedWatchlist.push(item);
        await AsyncStorage.setItem("watchlist", JSON.stringify(savedWatchlist));
      } else {
        const updatedWatchlist = savedWatchlist.filter(
          (coin) => coin.symbol !== item.symbol
        );
        await AsyncStorage.setItem(
          "watchlist",
          JSON.stringify(updatedWatchlist)
        );
      }

      fetchWatchlist();
    } catch (error) {
      console.error("Error saving to watchlist:", error);
    }
  };

  // API DATA COIN
  const pricesWs = new WebSocket(
    "wss://ws.coincap.io/prices?assets=bitcoin,ethereum,monero,litecoin,tether,solana,cardano"
  );

  // TEMPLATE LIST FOR DATA COIN
  const coinsList = [
    {
      name: "Bitcoin",
      symbol: "BTC",
      priceUsd: 0,
      iconUrl: require("./assets/btc.png"),
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      priceUsd: 0,
      iconUrl: require("./assets/eth.png"),
    },
    {
      name: "Monero",
      symbol: "XMR",
      priceUsd: 0,
      iconUrl: require("./assets/xmr.png"),
    },
    {
      name: "Litecoin",
      symbol: "LTC",
      priceUsd: 0,
      iconUrl: require("./assets/ltc.png"),
    },
    {
      name: "Tether",
      symbol: "USDT",
      priceUsd: 0,
      iconUrl: require("./assets/usdt.png"),
    },
    {
      name: "Solana",
      symbol: "SOL",
      priceUsd: 0,
      iconUrl: require("./assets/sol.png"),
    },
    {
      name: "Cardano",
      symbol: "ADA",
      priceUsd: 0,
      iconUrl: require("./assets/ada.png"),
    },
  ];
  // FETCH DATA COIN
  useEffect(() => {
    pricesWs.onmessage = async function (msg) {
      const coinData = JSON.parse(msg.data);

      for (const [key, value] of Object.entries(coinData)) {
        let indexed = coinsList.findIndex(
          (e) => e.name.toLowerCase() === key.toLowerCase()
        );
        coinsList[indexed].priceUsd = value;
      }
      console.log("tes");
      setCoin(coinsList);
      setIsLoading(false);
    };
  }, []);

  // FUNCTION SAVE TO WATCHLIST AND RENDER ITEM
  const renderItem = ({ item }) => {
    const isSaved = watchlist.some((coin) => coin.symbol === item.symbol);

    return (
      <Item item={item} isSaved={isSaved} handleSavePress={handleSavePress} />
    );
  };

  return (
    <View style={styles.AndroidSafeArea}>
      <View>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>
          Market Crypto
        </Text>

        {/* BUTTON WATCHLIST */}
        <TouchableOpacity
          style={{
            padding: 5,
            backgroundColor: "#ffbe0b",
            borderRadius: 10,
            width: 150,
            marginVertical: 10,
            alignSelf: "center",
          }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            See Your Watchlist
          </Text>
        </TouchableOpacity>
        {/* BUTTON WATCHLIST */}

        {/* LIST COIN */}
        {isLoading ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignSelf: "center",
              height: "80%",
              width: "100%",
              alignItems: "center",
            }}
          >
            <View>
              <LottieView
                style={{ flex: 1 , width: "100%" , height:"250%"}}
                source={require("./assets/coinloading.json")}
                autoPlay
                loop
                
              />
              <Text style={{ fontSize: 30, fontWeight: "800", color: "white" }}>
                LOADING....
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={coin}
            renderItem={renderItem}
            keyExtractor={(item) => item.symbol}
          />
        )}
        {/* LIST COIN */}

        {/* MODAL WATCHLIST */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={{ color: "white", fontSize: 20, fontWeight: "600" }}>
                Your Watchlist coin
              </Text>
              <FlatList
                data={watchlist}
                renderItem={renderItem}
                keyExtractor={(item) => item.symbol}
                // onPress={openModalBottomSheet}
              />

              <TouchableOpacity
                onPress={closeModal}
                style={styles.roundButton1}
              >
                <AntDesign
                  name="close"
                  style={{ alignSelf: "center" }}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* MODAL WATCHLIST */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  AndroidSafeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 14,
    backgroundColor: "#131313",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#131313",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    height: "100%",
  },
  roundButton1: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignSelf: "center",
    padding: 10,
    borderRadius: 100,
    backgroundColor: "red",
  },
  contentContainer: {
    padding: 10,
  },
});
