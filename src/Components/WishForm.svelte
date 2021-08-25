<script>
  import wishes from "../Stores/Wishes/wish-store";
  import { createEventDispatcher } from "svelte";
  import TextInput from "../UI/TextInput.svelte";
  import Button from "../UI/Button.svelte";
  import Modal from "../UI/Modal.svelte";
  import { validator } from "../Helpers/validator";

  let title = "";
  let subtitle = "";
  let address = "";
  let image = "";
  let email = "";
  let description = "";
  let isFavorite = false;
  let valid = false;

  export let id = null;
  export let editMode = false;
  $: if (id) {
    const unsubscribe = wishes.subscribe((items) => {
      const wishItem = items.find((item) => item.id === id);

      title = wishItem.title;
      subtitle = wishItem.subtitle;
      address = wishItem.address;
      image = wishItem.image;
      email = wishItem.email;
      description = wishItem.description;
    });
    unsubscribe();
  }

  const dispatch = createEventDispatcher();

  const submitForm = () => {
    dispatch("save-form-data");

    const wishData = {
      title: title,
      subtitle: subtitle,
      address: address,
      image: image,
      email: email,
      description: description,
      isFavorite: isFavorite,
    };

    if (id) {
      fetch(
        `https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes/${id}.json`,
        {
          method: "PATCH",
          body: JSON.stringify({
            ...wishData,
            isFavorite: false,
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Something went wrong.");
          }
          wishes.updateWish(id, wishData);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      fetch(
        "https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes.json",
        {
          method: "POST",
          body: JSON.stringify({
            ...wishData,
            isFavorite: false,
          }),
          headers: { "Content-Type": "application/json" },
        }
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Something went wrong.");
          }
          return res.json();
        })
        .then((data) => {
          wishes.addWish({ ...wishData, isFavorite: false, id: data.name });
          for (let i in data) {
            console.log({ ...data[i] }, "data");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const cancelForm = () => {
    dispatch("cancel");
  };
  const removeWish = () => {
    dispatch("remove-wish");
    fetch(
      `https://wishlist-app-d8867-default-rtdb.firebaseio.com/wishes/${id}.json`,
      {
        method: "DELETE",
      }
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Something went wrong.");
        }
        wishes.removeWish(id);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  $: if (
    validator(title) ||
    validator(subtitle) ||
    validator(address) ||
    validator(image) ||
    validator(email) ||
    validator(description)
  ) {
    valid = false;
  } else {
    valid = true;
  }
</script>

<Modal title="Create New Wish Item" on:cancel={cancelForm}>
  <div class="form-section">
    <form on:submit|preventDefault={submitForm}>
      <div class="form-control">
        <TextInput
          id="title"
          value={title}
          label="Title"
          on:input={(wish) => (title = wish.target.value)}
        />
      </div>
      <div class="form-control">
        <TextInput
          id="subtitle"
          value={subtitle}
          label="Subtitle"
          on:input={(wish) => (subtitle = wish.target.value)}
        />
      </div>
      <div class="form-control">
        <TextInput
          id="address"
          value={address}
          label="Address"
          on:input={(wish) => (address = wish.target.value)}
        />
      </div>
      <div class="form-control">
        <TextInput
          type="url"
          id="image"
          value={image}
          label="Image"
          on:input={(wish) => (image = wish.target.value)}
        />
      </div>

      <div class="form-control">
        <TextInput
          type="email"
          id="email"
          value={email}
          label="Email"
          on:input={(wish) => (email = wish.target.value)}
        />
      </div>
      <div class="form-control">
        <TextInput
          row="3"
          id="description"
          value={description}
          label="Description"
          on:input={(wish) => (description = wish.target.value)}
        />
      </div>
    </form>
  </div>
  <div slot="footer">
    <Button
      type="button"
      availability={!valid ? true : false}
      on:click={submitForm}>Submit</Button
    >
    <Button type="button" on:click={cancelForm}>Cancel</Button>
    {#if editMode}
      <Button on:click={removeWish}>Remove Wish</Button>
    {/if}
  </div>
</Modal>

<style>
  form {
    width: 100%;
  }

  .form-section {
    padding: 10px;
  }
</style>
