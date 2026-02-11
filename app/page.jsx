"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [allCards, setAllCards] = useState([]);

  const [searchedArchetypeName, setSearchedArchetypeName] = useState("");
  const [searchedArchetypeCards, setSearchedArchetypeCards] = useState([]);

  const [searchedCardName, setSearchedCardName] = useState("");
  const [searchedCards, setSearchedCards] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function getEveryCards() {
    try {
      const response = await fetch(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php`,
      );
      if (!response.ok) {
        throw new Error(`An error has occurred`);
      }
      const result = await response.json();
      setAllCards(result.data);
      return result.data;
    } catch (error) {
      console.error(error.message);
      setAllCards([]);
      return [];
    }
  }

  async function getSearchedArchetypeCards() {
    try {
      const response = await fetch(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?archetype=${searchedArchetypeName}`,
      );
      if (!response.ok) {
        throw new Error(`An error has occurred`);
      }
      const result = await response.json();
      setSearchedArchetypeCards(result.data);
      return result.data;
    } catch (error) {
      console.error(error.message);
      setSearchedArchetypeCards([]);
      return [];
    }
  }

  async function getSearchedCards() {
    try {
      const response = await fetch(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${searchedCardName}`,
      );
      if (!response.ok) {
        throw new Error(`An error has occurred`);
      }
      const result = await response.json();
      setSearchedCards(result.data);
      return result.data;
    } catch (error) {
      console.error(error.message);
      setSearchedCards([]);
      return [];
    }
  }

  async function storeCards(cards) {
    setLoading(true);
    setMessage("");
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const card of cards) {
        try {
          const cardData = {
            id: card.id,
            image: card.card_images?.[0]?.image_url || "",
            name: card.name,
            type: card.frameType,
            race: card.race,
            attribute: card.attribute || "N/A",
            level: card.level || 0,
            archetype: card.archetype || "None",
          };

          const res = await fetch("/api/cards", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(cardData),
          });

          const data = await res.json();

          if (res.ok) {
            successCount++;
          } else if (
            res.status === 400 &&
            data.message === "Card already exists"
          ) {
            // Skip already existing cards silently or count them separately
            console.log(`Card ${card.name} already exists`);
          } else {
            errorCount++;
            console.error(`Error storing ${card.name}:`, data.message);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error storing card:`, error.message);
        }
      }

      setMessage(
        `Storage complete! Success: ${successCount}, Errors: ${errorCount}`,
      );
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleStoreAllCards() {
    const cards = await getEveryCards();
    if (cards.length > 0) {
      await storeCards(cards);
    }
  }

  async function handleStoreArchetypeCards(event) {
    event.preventDefault();
    if (!searchedArchetypeName.trim()) {
      setMessage("Please enter an archetype name");
      return;
    }
    const cards = await getSearchedArchetypeCards();
    if (cards.length > 0) {
      await storeCards(cards);
    } else {
      setMessage("No cards found for this archetype");
    }
  }

  async function handleStoreSearchedCards(event) {
    event.preventDefault();
    if (!searchedCardName.trim()) {
      setMessage("Please enter a card name");
      return;
    }
    const cards = await getSearchedCards();
    if (cards.length > 0) {
      await storeCards(cards);
    } else {
      setMessage("No cards found");
    }
  }

  return (
    <div className=" flex flex-col text-white items-center gap-5">
      <h1 className=" mt-5 text-3xl font-extrabold">
        Duel Nexus DB Management
      </h1>

      {message && (
        <div className="bg-blue-900 px-4 py-2 rounded-lg">{message}</div>
      )}

      {loading && (
        <div className="bg-yellow-900 px-4 py-2 rounded-lg">
          Storing cards... Please wait.
        </div>
      )}

      <button
        onClick={handleStoreAllCards}
        disabled={loading}
        className=" bg-blue-950 cursor-pointer px-4 py-2 rounded-full text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Storing..." : "Store every cards"}
      </button>

      <form className=" flex flex-row" onSubmit={handleStoreArchetypeCards}>
        <input
          onChange={(event) => setSearchedArchetypeName(event.target.value)}
          value={searchedArchetypeName}
          disabled={loading}
          className=" outline-0 border border-white text-lg font-medium px-2 py-1 rounded-tl-lg rounded-bl-lg disabled:opacity-50"
          placeholder="Enter a archetype"
          type="text"
        />
        <button
          type="submit"
          disabled={loading}
          className=" bg-blue-950 border border-white cursor-pointer px-2 py-1 rounded-tr-lg rounded-br-lg text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Store
        </button>
      </form>

      <form onSubmit={handleStoreSearchedCards}>
        <input
          onChange={(event) => setSearchedCardName(event.target.value)}
          value={searchedCardName}
          disabled={loading}
          className=" outline-0 border border-white text-lg font-medium px-2 py-1 rounded-tl-lg rounded-bl-lg disabled:opacity-50"
          placeholder="Enter a card name"
          type="text"
        />
        <button
          type="submit"
          disabled={loading}
          className=" bg-blue-950 border border-white cursor-pointer px-2 py-1 rounded-tr-lg rounded-br-lg text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Store
        </button>
      </form>
    </div>
  );
}
