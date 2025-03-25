import {
  View,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Text,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons, FontAwesome, Ionicons } from "@expo/vector-icons";
import { Bubble, GiftedChat, IMessage } from "react-native-gifted-chat";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/theme/ThemeProvider";
import { COLORS, images } from "@/constants";
import { useLocalSearchParams, useNavigation } from "expo-router";
import axios from "axios";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

// Định nghĩa kiểu dữ liệu cho props của Chat component

// Định nghĩa kiểu tin nhắn
interface MessageType extends IMessage {
  image?: string;
}

const Chat: React.FC = () => {
  const [inputMessage, setInputMessage] = useState<string>("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const { colors, dark } = useTheme();
  const navigation = useNavigation();
  const { chat } = useLocalSearchParams();

  const renderMessage = (props: any) => {
    const { currentMessage } = props;

    if (currentMessage?.user._id === 1) {
      return (
        <View
          style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}
        >
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: COLORS.primary,
                marginRight: 12,
                marginVertical: 12,
              },
            }}
            textStyle={{ right: { color: COLORS.white } }}
          />
        </View>
      );
    } else {
      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-start",
          }}
        >
          <Image
            source={images.avatar}
            style={{
              height: 40,
              width: 40,
              borderRadius: 20,
              marginLeft: 8,
            }}
          />
          <Bubble
            {...props}
            wrapperStyle={{
              left: {
                backgroundColor: COLORS.secondaryWhite,
                marginLeft: 12,
                marginBottom: 10,
              },
            }}
            textStyle={{ left: { color: COLORS.black } }}
          />
        </View>
      );
    }
  };

  useEffect(() => {
    if (!chat) return;

    const chatString = Array.isArray(chat) ? chat.join("") : chat; // Ensure chat is a string
    let chatKey;

    try {
      chatKey = decodeURIComponent(chatString);
    } catch (error) {
      console.error("Error decoding chat string:", error);
      return;
    }

    const getData = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(chatKey);
        if (storedValue) {
          const parsedMessages = JSON.parse(storedValue); // Convert stored data into JS objects

          if (Array.isArray(parsedMessages)) {
            setMessages((prevMessages) =>
              GiftedChat.append(prevMessages, parsedMessages)
            );
          } else {
            console.warn("Stored data is not an array:", parsedMessages);
          }
        }
      } catch (e) {
        console.error("Error reading value:", e);
      }
    };

    getData();
  }, [chat]);
  const generateText = async () => {
    if (!inputMessage.trim()) return;
    setIsTyping(true);
    const userMessage: MessageType = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: { _id: 1 },
    };

    setMessages((prevMessages) =>
      GiftedChat.append(prevMessages, [userMessage])
    );

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: inputMessage },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Handle the response and update the chat UI

      const data = response.data;
      const botMessage: MessageType = {
        _id: Math.random().toString(36).substring(7),
        text: data.choices[0].message.content.trim(),
        createdAt: new Date(),
        user: { _id: 2, name: "ChatGPT" },
      };
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, [botMessage])
      );
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }

    setInputMessage("");
    setIsTyping(false);
  };

  const submitHandler = () => {
    generateText();
  };

  const handleInputText = (text: string) => {
    setInputMessage(text);
  };

  const onPressBack = useCallback(async () => {
    if (messages.length > 0) {
      try {
        await AsyncStorage.setItem(
          `${messages[0].text}`,
          JSON.stringify(messages)
        );
        console.log(messages.length, "messages");
      } catch (e) {
        // saving error
      } finally {
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  }, [messages]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <ThemedView
        style={[styles.headerView, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity onPress={onPressBack}>
          <Ionicons
            name="arrow-back"
            color={dark ? "white" : "black"}
            size={20}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonClear}
          onPress={() => setMessages([])}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Xóa tất cả
          </Text>
        </TouchableOpacity>
      </ThemedView>
      <GiftedChat
        messages={messages}
        user={{ _id: 1 }}
        renderMessage={renderMessage}
        isTyping={isTyping}
        onInputTextChanged={setInputMessage}
        onSend={submitHandler}
        renderInputToolbar={() => (
          <View
            style={{
              flexDirection: "row",
              backgroundColor: colors.background,
              paddingVertical: 8,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                marginLeft: 10,
                backgroundColor: colors.background,
                paddingVertical: 8,
                marginHorizontal: 12,
                borderRadius: 12,
                borderColor: colors.text,
                borderWidth: 0.2,
              }}
            >
              <TextInput
                value={inputMessage}
                onChangeText={handleInputText}
                placeholder="Enter your question"
                placeholderTextColor={colors.text}
                style={{
                  color: colors.text,
                  flex: 1,
                  paddingHorizontal: 10,
                }}
              />

              <TouchableOpacity
                onPress={submitHandler}
                style={{
                  padding: 6,
                  borderRadius: 8,
                  marginHorizontal: 12,
                }}
              >
                <FontAwesome name="send-o" color={COLORS.primary} size={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  headerView: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    justifyContent: "space-between",
  },
  buttonClear: {},
});
export default Chat;
