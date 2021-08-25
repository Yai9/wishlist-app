<script>
  import { onDestroy } from "svelte";
  import wishes from "../Stores/Wishes/wish-store";

  export let wishDetail;
  export let wishId;

  const unsubscribe = wishes.subscribe((items) => {
    const item = { ...items.find((i) => i.id === wishId) };
    wishDetail = {
      title: item.title,
      subtitle: item.subtitle,
      address: item.address,
      image: item.image,
      email: item.email,
      description: item.description,
      isFavorite: item.isFavorite,
    };
  });
  onDestroy(() => {
    unsubscribe();
  });
</script>

<section>
  <div class="image">
    <img src={wishDetail.image} alt={wishDetail.title} />
  </div>
  <div>
    <h1>{wishDetail.title}</h1>
  </div>
  <div>
    <h2>{wishDetail.subtitle}</h2>
    <div />
    <div>
      <p>{wishDetail.address}</p>
    </div>
    <div>
      <p>{wishDetail.email}</p>
    </div>
    <div class="content">
      <p>{wishDetail.description}</p>
    </div>
  </div>
</section>

<style>
  section {
    margin-top: 4rem;
  }

  .image {
    width: 100%;
    height: 25rem;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .image {
    background: #e7e7e7;
  }

  .content {
    text-align: center;
    width: 80%;
    margin: auto;
  }

  h1 {
    font-size: 2rem;
    font-family: "Roboto Slab", sans-serif;
    margin: 0.5rem 0;
  }

  h2 {
    font-size: 1.25rem;
    color: #6b6b6b;
  }

  p {
    font-size: 1.5rem;
  }
</style>
