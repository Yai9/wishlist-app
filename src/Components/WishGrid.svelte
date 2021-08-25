<script>
  import WishItem from "./WishItem.svelte";
  import WishFilter from "./WishFilter.svelte";
  import { scale } from "svelte/transition";
  import { flip } from "svelte/animate";

  export let wishes;
  export let filterFavorites = false;

  const setFilter = (wish) => {
    filterFavorites = wish.detail === 1;
  };

  $: filterFavs = filterFavorites ? wishes.filter((e) => e.isFavorite) : wishes;
  $: console.log(filterFavs, "favs");
</script>

<section id="wish-controls">
  <WishFilter on:filter-wishes={setFilter} />
</section>

<section id="wishes">
  {#each filterFavs as wish (wish.id)}
    <div transition:scale animate:flip={{ duration: 400 }}>
      <WishItem
        id={wish.id}
        title={wish.title}
        subtitle={wish.subtitle}
        address={wish.address}
        image={wish.image}
        email={wish.email}
        description={wish.description}
        isFavorite={wish.isFavorite}
        on:show-details
        on:edit-wish
      />
    </div>
  {/each}
</section>

<style>
  #wishes {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 1rem;
  }

  #wish-controls {
    margin: 1rem;
    display: flex;
    justify-content: space-between;
  }

  @media (min-width: 768px) {
    #wishes {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
