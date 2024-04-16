<template>
	<v-navigation-drawer
		location="left"
		v-model:rail="drawer"
		rail
		expand-on-hover
		color="bg_navbar"
		permanent
		@mouseleave="activeOption = []"
	>
		<div class="px-2 pt-3 d-flex w-full justify-center">
			<v-img src="../../img/SIEG.png" height="auto" max-width="80px" />
		</div>

		<v-list open-strategy="single" nav v-model:selected="selectedOption" v-model:opened="activeOption">
			<template v-for="(item, itemIndex) in menuOptions" :key="itemIndex">
				<v-list-item
					v-if="!item.tabs"
					:key="itemIndex"
					v-show="item.setores.includes('ALL') || item.setores.some((setor) => setor === user?.tipo?.sigla)"
					:value="getItemValue(item)"
					:to="item.to"
					color="#118b9f"
					style="color: #118b9f"
					:prepend-icon="item.icon"
				>
					<template #title>
						<span class="sidebar-item">{{ item.title }}</span>
					</template>
				</v-list-item>

				<v-list-group v-else :value="getItemValue(item)" fluid>
					<template #activator="{ props }">
						<v-list-item v-bind="props" :value="item.active" color="primary">
							<v-icon :icon="item.icon" />

							<template #title>
								<span class="sidebar-item">{{ item.title }}</span>
							</template>
						</v-list-item>
					</template>

					<v-card color="bg_secondary" flat>
						<v-list-item
							v-for="(sub, subIndex) in item.tabs"
							:key="subIndex"
							:value="getSubitemValue(item, sub)"
							:to="sub.to"
							exact
							variant="text"
							color="primary"
						>
							<template #prepend>
								<v-icon :color="sub.color" :icon="sub.icon" />
							</template>

							<template #title>
								<span class="sidebar-item">{{ sub.title }}</span>
							</template>
						</v-list-item>
					</v-card>
				</v-list-group>
			</template>
		</v-list>
	</v-navigation-drawer>
</template>

<script setup>
//* IMPORTS

import { useAuthStore } from '~/store/auth';
const { authenticateUser } = useAuthStore();
const route = useRoute();

//* DATA

const user = ref({});
const activeOption = ref([]);
const selectedOption = ref([]);
const drawer = ref(true);
let timer;

//* METHODS

const login = async () => {
	try {
		const usuario = await useOs().getUser();
		const sigla = usuario?.username?.toUpperCase();

		const { success, user: data } = await authenticateUser(sigla);
		if (!success) throw new Error('Erro ao autenticar usuário');

		user.value = data;
	} 
	catch (error) {
		console.error('Erro ao autenticar usuário:', error);
	}
};

const menuOptions = ref([
	{ title: 'Pagamentos', icon: 'mdi-cash-check', to: '/', setores: ['ALL'] },
	{ title: 'Novo pagamento', icon: 'mdi-cash-plus', to: '/novo/pagamento', setores: ['ALL'] },
	{ title: 'Financeiro', icon: 'mdi-account-cash-outline', to: '/financeiro', setores: ['FIN', 'GER', 'ADM'] },
	{ title: 'Gerência', icon: 'mdi-account-tie-outline', to: '/gerencia', setores: ['GER'] },
	{ title: 'Histórico', icon: 'mdi-clock-outline', to: '/historico', setores: ['GER'] },
]);

//* ACTIONS

const getItemValue = (item) => `item-${item.title.toLowerCase()}`;
const getSubitemValue = (item, sub) => `item-${item.title.toLowerCase()}-subitem-${sub.title.toLowerCase()}`;

//* HOOKS

onBeforeMount(async () => await login());

//* WATCHERS

watch(() => route.path, (value) => {
		if (timer) clearTimeout(timer);

		const match = /^\/(\w+)\/(\w+)/.exec(value);
		if (!match) return;

		selectedOption.value = [`item-${match[1]}-subitem-${match[2]}`];
		timer = setTimeout(() => {
			if (drawer.value) activeOption.value = [];
		}, 2000);
	},
	{ deep: true, immediate: true }
);
</script>

<style>
.sidebar-item {
	font-size: 15px;
}
</style>
