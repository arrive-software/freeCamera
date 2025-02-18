//Copyright 2025 p2991908(p299-dev),Jason Lee(arrive-software)
/*This file is part of freeCamera.

freeCamera is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

freeCamera is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with freeCamera. If not, see <https://www.gnu.org/licenses/>.
*/
import { world } from '@minecraft/server';
// 定义一个对象来存储玩家的坐标点
const savedLocations = {};
// 保存玩家坐标点的函数
function savePlayerLocation(player) {
    // 检查玩家是否具有“离体”标签
    if (player.hasTag('outOfBody')) {
        return;
    }
    const location = {
        x: player.location.x,
        y: player.location.y,
        z: player.location.z,
        dimension: player.dimension.id
    };
    // 使用玩家名来存储坐标
    savedLocations[player.nameTag] = location;
    player.runCommand('tickingarea add circle ~ ~ ~ 3');//防卸载
    const armorName = 'a' + player.name//使用a+玩家名作为盔甲架的名字
    player.runCommand('summon armor_stand ' + armorName);
    player.runCommand('gamemode spectator @s');
    player.runCommand('effect @s night_vision 99999 1 true');
    player.runCommand('title @s actionbar 开启 §a自由相机');
    //加入离体标签
    player.runCommand('tag @s add outOfBody');
}
// 传送玩家到保存的坐标点并删除坐标点信息
function teleportAndRemoveSavedLocation(player) {
    const location = savedLocations[player.nameTag];
    if (location) {
        const dimension = world.getDimension(location.dimension);
        player.teleport({
            x: location.x,
            y: location.y,
            z: location.z,
            dimension: dimension // 使用获取到的dimension对象
        });
        // 删除保存的坐标点信息
        delete savedLocations[player.nameTag];
        const ArmorName = 'a' + player.name       
        player.runCommand(`kill @e[name=${ArmorName}]`);
        player.runCommand('gamemode default @s');
        player.runCommand('title @s[tag=outOfBody] actionbar 关闭§c自由相机');
        player.runCommand('title @s[tag=!outOfBody] actionbar §4自由相机未开启');
        player.runCommand('effect @s clear night_vision');
        player.runCommand('tickingarea remove ~ ~ ~');
        player.runCommand('tag @s remove outOfBody');
    } else {
    }
}
// 监听玩家聊天事件
world.afterEvents.chatSend.subscribe((event) => {
    const { message } = event;
    const player = event.sender;
    // 玩家输入“开启”时保存当前坐标点
    if (message === "on") {
        savePlayerLocation(player);
    }
    // 玩家输入“关闭”时传送到保存的坐标点并删除坐标点信息
    if (message === "off") {
        teleportAndRemoveSavedLocation(player);
    }else{
    }
});
