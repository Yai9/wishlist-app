<script>
  import { createEventDispatcher } from "svelte";

  let selectedButton = 0;

  export let filterFavorites = false;

  const dispatch = createEventDispatcher();

  const showAll = () => {
    dispatch("filter-wishes", 0);
    selectedButton = 0;
  };
  const showFavorites = () => {
    dispatch("filter-wishes", 1);
    selectedButton = 1;
  };
</script>

<div>
  <button class:active={selectedButton === 0} on:click={showAll}>All</button>
  <button class:active={selectedButton === 1} on:click={showFavorites}
    >Favorites</button
  >
</div>

<style>
  div {
    font-size: 20px;
  }

  button {
    background: #aaaaaa;
    font: inherit;
    font-size: 20px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid #aaaaaa;
    padding: 0.5rem 1rem;
  }

  button:focus {
    outline: none;
  }

  button:first-of-type {
    border-radius: 5px 0 0 5px;
  }

  button:last-of-type {
    border-radius: 0 5px 5px 0;
  }

  button:hover,
  button:active,
  .active {
    background: #0fe;
    border-color: #0fe;
    color: white;
  }
</style>
