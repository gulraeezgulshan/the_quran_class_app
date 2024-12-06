import { Audio } from "expo-av";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Verse } from "../types";
import React from "react";

type RouteParams = {
	id: string;
	name_arabic: string;
};

const PER_PAGE = 10;
const BASE_AUDIO_URL = "https://verses.quran.com/";

const VerseItem = React.memo(({ verse }: { verse: Verse }) => {
	const [sound, setSound] = React.useState<Audio.Sound | null>(null);
	const [isPlaying, setIsPlaying] = React.useState(false);

	async function togglePlayback() {
		try {
			// Case 1: Audio is playing - Pause it
			if (isPlaying && sound) {
				await sound.pauseAsync();
				setIsPlaying(false);
				return;
			}

			// Case 2: Sound is loaded but paused - Resume it
			if (sound) {
				await sound.playAsync();
				setIsPlaying(true);
				return;
			}

			// Case 3: First time playing - Load and play new sound
			const { sound: newSound } = await Audio.Sound.createAsync(
				{ uri: BASE_AUDIO_URL + verse.audio.url },
				{ shouldPlay: true }
			);

			setSound(newSound);
			setIsPlaying(true);

			// Automatically pause when the sound finishes playing
			newSound.setOnPlaybackStatusUpdate((status) => {
				if (
					status &&
					"didJustFinish" in status &&
					status.didJustFinish
				) {
					setIsPlaying(false);
				}
			});
		} catch (error) {
			console.error("Error playing sound:", error);
		}
	}

	React.useEffect(() => {
		return sound
			? () => {
					sound.unloadAsync();
			  }
			: undefined;
	}, [sound]);

	return (
		<View className="py-4 border-b border-gray-200">
			<Text className="text-lg rtl:text-right mb-2">
				{verse.verse_number}. {verse.text_indopak}
			</Text>
			<View className="flex-row flex-wrap mt-2">
				{verse.words.map((word) => (
					<Text
						key={word.id}
						style={{ textAlign: "right" }}
						className="mr-2 text-gray-600"
					>
						{word.translation.text}
					</Text>
				))}
			</View>
			<TouchableOpacity
				onPress={togglePlayback}
				className="mt-2 bg-blue-500 p-2 rounded-lg w-20"
			>
				<Text className="text-white text-center">
					{isPlaying ? "Pause" : "Play"}
				</Text>
			</TouchableOpacity>
		</View>
	);
});

const VerseScreen = () => {
	const params = useLocalSearchParams<RouteParams>();
	const { id, name_arabic } = params;

	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["verses", id],
		queryFn: async ({ pageParam = 1 }) => {
			console.log("Fetching page:", pageParam);
			const response = await fetch(
				`https://api.quran.com/api/v4/verses/by_chapter/${id}?language=ur&audio=1&words=true&fields=text_indopak&per_page=${PER_PAGE}&page=${pageParam}`
			);
			return response.json();
		},
		getNextPageParam: (lastPage) => {
			//console.log("Last page:", lastPage);
			if (
				lastPage.pagination.current_page <
				lastPage.pagination.total_pages
			) {
				return lastPage.pagination.current_page + 1;
			}
			return undefined;
		},
		initialPageParam: 1,
	});

	const loadMore = () => {
		if (hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	};

	if (isLoading) return <Text>Loading...</Text>;
	if (error) return <Text>Error loading verses</Text>;

	//console.log(data);

	const allVerses = data?.pages.flatMap((page) => page.verses) ?? [];

	//console.log(allVerses);

	return (
		<View className="flex-1">
			<FlatList
				removeClippedSubviews={true}
				maxToRenderPerBatch={10}
				windowSize={5}
				initialNumToRender={10}
				data={allVerses}
				keyExtractor={(item) => item.id.toString()}
				renderItem={({ item }) => <VerseItem verse={item} />}
				ListHeaderComponent={() => (
					<View className="p-4 bg-white">
						<Text className="text-xl font-bold rtl:text-right">
							{name_arabic}
						</Text>
						<Text className="text-lg">Chapter ID: {id}</Text>
					</View>
				)}
				ListFooterComponent={() =>
					isFetchingNextPage ? (
						<View className="py-4">
							<Text className="text-center">
								Loading more verses...
							</Text>
						</View>
					) : null
				}
				onEndReached={loadMore}
				onEndReachedThreshold={0.3}
				contentContainerStyle={{ padding: 16 }}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
};

export default VerseScreen;
