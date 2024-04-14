<template>
  <div>
    <v-row>
      <v-col cols="2">
        <p>
          <Test :msg="req" />
          isElectron: {{ useElectron().isElectron }} Boa Noite
          <v-icon @click="goTo" color="primary">mdi-moon-waning-crescent</v-icon>
          <v-text-field required hide-details v-model="req" color="red">
            <template #prepend>
              <v-icon >mdi-moon-waning-crescent</v-icon>
            </template>
          </v-text-field>
          <v-btn @click="goTo" color="purple">
            <v-icon>mdi-moon-waning-crescent</v-icon>
            Boa Noite
          </v-btn>
        </p>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>

const req = ref('')

import { useRouter} from 'vue-router';

const router = useRouter();
const route = useRoute()

const goTo = () => {
  console.log('goTo')
  router.push('/historico')
}
</script>