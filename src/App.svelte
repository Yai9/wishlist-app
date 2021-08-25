<script>
  import wishes from "./Stores/Wishes/wish-store";
  import Header from "./UI/Header.svelte";
  import WishGrid from "./Components/WishGrid.svelte";
  import WishForm from "./Components/WishForm.svelte";
  import Button from "./UI/Button.svelte";
  import Loader from "./UI/Loader.svelte";
  import Error from "./UI/Error.svelte";

  import WishDetail from "./Components/WishDetail.svelte";

  let opened = false;
  let wishId = {};
  let loading = true;

  export let UIMode = "overview";
  export let editMode = false;
  export let error;

  fetch("https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes.json")
    .then((res) => {
      if (!res.ok) {
        throw new Error("Something went wrong.");
      }
      return res.json();
    })
    .then((data) => {
      let loadedWishes = [];
      for (let key in data) {
        loadedWishes.push({
          ...data[key],
          id: key,
        });
        console.log(data);
      }
      setTimeout(() => {
        loading = false;
        wishes.setWishes(loadedWishes);
      }, 1000);
    })
    .catch((err) => {
      error = err;
      console.log(err);
    });

  const submitWishesHandler = () => {
    UIMode = "overview";
    opened = false;
    wishId.id = null;
  };

  const cancelWish = () => {
    opened = false;
    wishId.id = null;
  };

  const showDetails = (wish) => {
    wishId.id = wish.detail;
    UIMode = "detail";
  };

  const closeDetailCard = () => {
    UIMode = "overview";
    wishId.id = null;
  };

  const editWish = (wish) => {
    opened = true;
    wishId.id = wish.detail;
    editMode = true;
  };

  const removeWish = () => {
    const id = wishId.id;
    wishes.removeWish(id);
    opened = false;
    wishId.id = null;
    editMode = false;
  };

  const closeError = () => {
    error = null;
  };
</script>

<Header />
<main>
  {#if error}
    <Error message={error.message} on:close={closeError} />
  {/if}
  <div class="wish-controls">
    {#if UIMode === "overview"}
      <Button on:click={() => (opened = true)}>New Wish</Button>
      {#if opened}
        <WishForm
          on:save-form-data={submitWishesHandler}
          on:cancel={cancelWish}
          on:remove-wish={removeWish}
          id={wishId.id}
          {editMode}
        />
      {/if}
      {#if loading}
        <Loader />
      {:else}
        <WishGrid
          wishes={$wishes}
          on:show-details={showDetails}
          on:edit-wish={editWish}
          {loading}
        />
      {/if}
    {:else if UIMode === "detail"}
      <WishDetail wishId={wishId.id} />
      <Button on:click={closeDetailCard}>Back</Button>
    {/if}
  </div>
</main>

<style>
  main {
    margin-top: 6rem;
  }
  .wish-controls {
    margin: 1rem;
  }
</style>
