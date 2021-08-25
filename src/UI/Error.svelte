<script>
  import Modal from "../UI/Modal.svelte";

  export let message;
</script>

<Modal on:close>
  <div>
    <p>{message}</p>
  </div>
</Modal>
