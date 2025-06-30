export const registerSystemSettings = function() {

  /**
   * Track the system version upon which point a migration was last applied
   */
  game.settings.register("bitd", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: Number,
    default: 0
  });
  
  if (foundry.utils.isNewerVersion(game.version, 12)) {

    game.settings.register('blades-in-the-dark', 'ActionRoll', {
	name: game.i18n.localize('BITD.Settings.Action.Name'),
	hint: game.i18n.localize('BITD.Settings.Action.Hint'),
	config: true,
	default: true,
	scope: 'world',
	type: new foundry.data.fields.BooleanField(),
	requiresReload: true
  });
	
	game.settings.register('blades-in-the-dark', 'ThreatRoll', {
	name: game.i18n.localize('BITD.Settings.Threat.Name'),
	hint: game.i18n.localize('BITD.Settings.Threat.Hint'),
	config: true,
	scope: 'world',
	type: new foundry.data.fields.BooleanField(),
	requiresReload: true
  });
  
  game.settings.register('blades-in-the-dark', 'PushYourself', {
	name: game.i18n.localize('BITD.Settings.Push.Name'),
	hint: game.i18n.localize('BITD.Settings.Push.Hint'),
	config: true,
	scope: 'world',
	type: new foundry.data.fields.BooleanField(),
	requiresReload: true
  });
  
    game.settings.register('blades-in-the-dark', 'DeepCutLoad', {
	name: game.i18n.localize('BITD.Settings.Load.Name'),
	hint: game.i18n.localize('BITD.Settings.Load.Hint'),
	config: true,
	scope: 'world',
	type: new foundry.data.fields.BooleanField(),
	requiresReload: true
  });
  
    game.settings.register('blades-in-the-dark', 'ClockXP', {
	name: game.i18n.localize('BITD.Settings.ClockXP.Name'),
	hint: game.i18n.localize('BITD.Settings.ClockXP.Hint'),
	config: true,
	scope: 'world',
	type: new foundry.data.fields.BooleanField(),
	requiresReload: true
  });
  
    game.settings.register('blades-in-the-dark', 'Edge', {
	name: game.i18n.localize('BITD.Settings.Edge.Name'),
	hint: game.i18n.localize('BITD.Settings.Edge.Hint'),
	config: true,
	scope: 'world',
	type: new foundry.data.fields.BooleanField(),
	requiresReload: true
  });
  
  	game.settings.register('blades-in-the-dark', 'PublicClocks', {
	name: game.i18n.localize('BITD.Settings.PublicClocks.Name'),
	hint: game.i18n.localize('BITD.Settings.PublicClocks.Hint'),
	config: true,
	scope: 'world',
	type: new foundry.data.fields.BooleanField(),
	requiresReload: true
  });
  
  } //end if for game.version >12
  else {
	  
  const set_array = [['ActionRoll','Action'],['ThreatRoll','Threat'],['PushYourself','Push'],['DeepCutLoad','Load'],['ClockXP','ClockXP'],['Edge','Edge'],['PublicClocks','PublicClocks']];
 
  for (let i=0; i<set_array.length; i++) {
	  
	game.settings.register('blades-in-the-dark', set_array[i][0], {
		name: game.i18n.localize('BITD.Settings.'+set_array[i][1]+'.Name'),
		hint: game.i18n.localize('BITD.Settings.'+set_array[i][1]+'.Hint'),
		config: true,
		scope: 'world',
		type: Boolean,
		requiresReload: true
	});
  }
	  
  }

};
