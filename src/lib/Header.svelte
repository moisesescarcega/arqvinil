<script lang="ts">
    import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
  </script>
  <header>
      <Navbar class="md:flex bg-gray-200 dark:bg-gray-800 h-[48px] p-0">
          <NavBrand href="/" class="text-md flex flex-row items-center">
              <img src="logo_viniles_bco.png" alt="Logo" class="h-8" />
              <span class="text-md font-bold text-gray-900 dark:text-white">Vinil para tu Lap!</span>
          </NavBrand>
          <!-- <NavHamburger />
          <NavUl>
              <NavLi href="/" class="text-gray-900 dark:text-white">Home</NavLi>
              <NavLi href="/about" class="text-gray-900 dark:text-white">About</NavLi>
              <NavLi href="/contact" class="text-gray-900 dark:text-white">Contact</NavLi>
          </NavUl> -->
      </Navbar>
  </header>