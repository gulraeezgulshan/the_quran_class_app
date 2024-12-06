import {
	Text,
	View,
	FlatList,
	SafeAreaView,
	TouchableOpacity,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ChaptersResponse } from "../types";
import { useRouter } from "expo-router";

function ChaptersList() {
	const router = useRouter();

	const { data, isLoading, error } = useQuery<ChaptersResponse>({
		queryKey: ["chapters"],
		queryFn: async () => {
			const response = await fetch(
				"https://api.quran.com/api/v4/chapters"
			);
			return response.json();
		},
	});

	if (isLoading) return <Text>Loading...</Text>;
	if (error) return <Text>Error: {(error as Error).message}</Text>;

	return (
		<FlatList
			data={data?.chapters}
			keyExtractor={(item) => item.id.toString()}
			renderItem={({ item }) => (
				<TouchableOpacity
					onPress={() =>
						router.push({
							pathname: "/verses",
							params: {
								id: item.id,
								name_arabic: item.name_arabic,
							},
						})
					}
				>
					<View className="p-4 border-b border-gray-200">
						<Text className="text-lg font-bold">
							{item.name_simple}
						</Text>
						<Text className="text-xl">{item.name_arabic}</Text>
						<Text className="text-sm text-gray-600">
							{item.translated_name.name} • {item.verses_count}{" "}
							verses
						</Text>
					</View>
				</TouchableOpacity>
			)}
		/>
	);
}

export default function App() {
	return (
		<SafeAreaView className="flex-1">
			<ChaptersList />
		</SafeAreaView>
	);
}
