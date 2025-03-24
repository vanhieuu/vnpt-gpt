import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SIZES } from "@/constants";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeProvider";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Link, useNavigation, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = () => {
  const { dark, colors, setScheme } = useTheme();
  const ToggleTheme = () => {
    dark ? setScheme("light") : setScheme("dark");
  };
  const [state, setState] = React.useState<any>(null);
  const route = useRouter()

  const getAllData = async () => {
    try {
      const jsonValue = await AsyncStorage.getAllKeys();
      setState(jsonValue);
      return jsonValue;
    } catch (e) {
      // error reading value
    }
  };

  React.useEffect(() => {
    getAllData();
  }, []);


  return (
    <SafeAreaView
      style={[
        styles.areaStyle,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView>
        <View style={styles.center}>
          <TouchableOpacity onPress={ToggleTheme}>
            <Ionicons
              name={dark ? "sunny-outline" : "partly-sunny-sharp"}
              size={32}
              color={dark ? COLORS.white : COLORS.black}
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.subTitle,
              {
                color: colors.text,
              },
            ]}
          >
            Examples
          </Text>
          {state &&
            state.length > 0 &&
            state.map((item: any) => {
              return (
                <TouchableOpacity
                  style={[
                    styles.box,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.text,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Link
                    href={{
                      pathname: "./chat",
                      params: { chat: item },
                    }}
                  >
                    <Text style={[styles.boxText, { color: colors.text }]}>
                      {item}
                    </Text>
                  </Link>
                </TouchableOpacity>
              );
            })}
            <Link href={"./chat"} style={{justifyContent:'center',alignItems:'center'}}>
          <TouchableOpacity style={styles.btn} onPress={()  => route.push("./chat")}> 
              <AntDesign name="plus" size={24} color={COLORS.white} />
              <Text style={styles.btnText}>New Chat</Text>
          </TouchableOpacity>
            </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  areaStyle: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subTitle: {
    ...FONTS.h4,
    marginVertical: 22,
  },
  box: {
    width: 300,
    paddingVertical: 18,
    marginVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  boxText: {
    ...FONTS.body4,
    textAlign: "center",
    color: COLORS.white,
  },

  btn: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    
    backgroundColor: COLORS.primary,
    width: 300,
    paddingVertical: SIZES.padding * 2,
  },
  btnText: {
    ...FONTS.body3,
    color: COLORS.white,
    marginLeft: 8,
  },
});
export default Home;
